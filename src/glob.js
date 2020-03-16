// Approach:
//
// 1. Get the minimatch set
// 2. For each pattern in the set, PROCESS(pattern, false)
// 3. Store matches per-set, then uniq them
//
// PROCESS(pattern, inGlobStar)
// Get the first [n] items from pattern that are all strings
// Join these together.  This is PREFIX.
//   If there is no more remaining, then stat(PREFIX) and
//   add to matches if it succeeds.  END.
//
// If inGlobStar and PREFIX is symlink and points to dir
//   set ENTRIES = []
// else readdir(PREFIX) as ENTRIES
//   If fail, END
//
// with ENTRIES
//   If pattern[n] is GLOBSTAR
//     // handle the case where the globstar match is empty
//     // by pruning it out, and testing the resulting pattern
//     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
//     // handle other cases.
//     for ENTRY in ENTRIES (not dotfiles)
//       // attach globstar + tail onto the entry
//       // Mark that this entry is a globstar match
//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
//
//   else // not globstar
//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
//       Test ENTRY against pattern[n]
//       If fails, continue
//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
//
// Caveat:
//   Cache all stats and readdirs results to minimize syscall.  Since all
//   we ever care about is existence and directory-ness, we can just keep
//   `true` for files, and [children,...] for directories, or `false` for
//   things that don't exist.

export default glob;

import fs from "fs";
import rp from "fs.realpath";
import minimatch from "minimatch";
const Minimatch = minimatch.Minimatch;
import inherits from "inherits";
import { EventEmitter as EE } from "events";
import path from "path";
import assert from "assert";
import isAbsolute from "path-is-absolute";
import globSync from "./sync.js";
import * as common from "./common.js";
const alphasort = common.alphasort;
const alphasorti = common.alphasorti;
const setopts = common.setopts;
const ownProp = common.ownProp;
import inflight from "inflight";
import util from "util";
const childrenIgnored = common.childrenIgnored;
const isIgnored = common.isIgnored;

import once from "once";

function glob(pattern, options, cb) {
  if (typeof options === "function") (cb = options), (options = {});
  if (!options) options = {};

  if (options.sync) {
    if (cb) throw new TypeError("callback provided to sync glob");
    return globSync(pattern, options);
  }

  return new Glob(pattern, options, cb);
}

glob.sync = globSync;
const GlobSync = (glob.GlobSync = globSync.GlobSync);

// old api surface
glob.glob = glob;

function extend(origin, add) {
  if (add === null || typeof add !== "object") {
    return origin;
  }

  const keys = Object.keys(add);
  let i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

glob.hasMagic = (pattern, options_) => {
  const options = extend({}, options_);
  options.noprocess = true;

  const g = new Glob(pattern, options);
  const set = g.minimatch.set;

  if (!pattern) return false;

  if (set.length > 1) return true;

  for (let j = 0; j < set[0].length; j++) {
    if (typeof set[0][j] !== "string") return true;
  }

  return false;
};

glob.Glob = Glob;
inherits(Glob, EE);

class Glob {
  constructor(pattern, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = null;
    }

    if (options && options.sync) {
      if (cb) throw new TypeError("callback provided to sync glob");
      return new GlobSync(pattern, options);
    }

    if (!(this instanceof Glob)) return new Glob(pattern, options, cb);

    setopts(this, pattern, options);
    this._didRealPath = false;

    // process each pattern in the minimatch set
    const n = this.minimatch.set.length;

    // The matches are stored as {<filename>: true,...} so that
    // duplicates are automagically pruned.
    // Later, we do an Object.keys() on these.
    // Keep them as a list so we can fill in when nonull is set.
    this.matches = new Array(n);

    if (typeof cb === "function") {
      cb = once(cb);
      this.on("error", cb);
      this.on("end", matches => {
        cb(null, matches);
      });
    }

    const self = this;
    this._processing = 0;

    this._emitQueue = [];
    this._processQueue = [];
    this.paused = false;

    if (this.noprocess) return this;

    if (n === 0) return done();

    let sync = true;
    for (let i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false, done);
    }
    sync = false;

    function done() {
      --self._processing;
      if (self._processing <= 0) {
        if (sync) {
          process.nextTick(() => {
            self._finish();
          });
        } else {
          self._finish();
        }
      }
    }
  }

  _finish() {
    assert(this instanceof Glob);
    if (this.aborted) return;

    if (this.realpath && !this._didRealpath) return this._realpath();

    common.finish(this);
    this.emit("end", this.found);
  }

  _realpath() {
    if (this._didRealpath) return;

    this._didRealpath = true;

    let n = this.matches.length;
    if (n === 0) return this._finish();

    const self = this;
    for (let i = 0; i < this.matches.length; i++) this._realpathSet(i, next);

    function next() {
      if (--n === 0) self._finish();
    }
  }

  _realpathSet(index, cb) {
    const matchset = this.matches[index];
    if (!matchset) return cb();

    const found = Object.keys(matchset);
    const self = this;
    let n = found.length;

    if (n === 0) return cb();

    const set = (this.matches[index] = Object.create(null));
    found.forEach((p, i) => {
      // If there's a problem with the stat, then it means that
      // one or more of the links in the realpath couldn't be
      // resolved.  just return the abs value in that case.
      p = self._makeAbs(p);
      rp.realpath(p, self.realpathCache, (er, real) => {
        if (!er) set[real] = true;
        else if (er.syscall === "stat") set[p] = true;
        else self.emit("error", er); // srsly wtf right here

        if (--n === 0) {
          self.matches[index] = set;
          cb();
        }
      });
    });
  }

  _mark(p) {
    return common.mark(this, p);
  }

  _makeAbs(f) {
    return common.makeAbs(this, f);
  }

  abort() {
    this.aborted = true;
    this.emit("abort");
  }

  pause() {
    if (!this.paused) {
      this.paused = true;
      this.emit("pause");
    }
  }

  resume() {
    if (this.paused) {
      this.emit("resume");
      this.paused = false;
      if (this._emitQueue.length) {
        const eq = this._emitQueue.slice(0);
        this._emitQueue.length = 0;
        for (var i = 0; i < eq.length; i++) {
          const e = eq[i];
          this._emitMatch(e[0], e[1]);
        }
      }
      if (this._processQueue.length) {
        const pq = this._processQueue.slice(0);
        this._processQueue.length = 0;
        for (var i = 0; i < pq.length; i++) {
          const p = pq[i];
          this._processing--;
          this._process(p[0], p[1], p[2], p[3]);
        }
      }
    }
  }

  _process(pattern, index, inGlobStar, cb) {
    assert(this instanceof Glob);
    assert(typeof cb === "function");

    if (this.aborted) return;

    this._processing++;
    if (this.paused) {
      this._processQueue.push([pattern, index, inGlobStar, cb]);
      return;
    }

    //console.error('PROCESS %d', this._processing, pattern)

    // Get the first [n] parts of pattern that are all strings.
    let n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    // now n is the index of the first one that is *not* a string.

    // see if there's anything else
    let prefix;
    switch (n) {
      // if not, then this is rather simple
      case pattern.length:
        this._processSimple(pattern.join("/"), index, cb);
        return;

      case 0:
        // pattern *starts* with some non-trivial item.
        // going to readdir(cwd), but not include the prefix in matches.
        prefix = null;
        break;

      default:
        // pattern has some string bits in the front.
        // whatever it starts with, whether that's 'absolute' like /foo/bar,
        // or 'relative' like '../baz'
        prefix = pattern.slice(0, n).join("/");
        break;
    }

    const remain = pattern.slice(n);

    // get the list of entries.
    let read;
    if (prefix === null) read = ".";
    else if (isAbsolute(prefix) || isAbsolute(pattern.join("/"))) {
      if (!prefix || !isAbsolute(prefix)) prefix = `/${prefix}`;
      read = prefix;
    } else read = prefix;

    const abs = this._makeAbs(read);

    //if ignored, skip _processing
    if (childrenIgnored(this, read)) return cb();

    const isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
    else this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
  }

  _processReaddir(prefix, read, abs, remain, index, inGlobStar, cb) {
    const self = this;
    this._readdir(abs, inGlobStar, (er, entries) =>
      self._processReaddir2(
        prefix,
        read,
        abs,
        remain,
        index,
        inGlobStar,
        entries,
        cb
      )
    );
  }

  _processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    // if the abs isn't a dir, then nothing can match!
    if (!entries) return cb();

    // It will only match dot entries if it starts with a dot, or if
    // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
    const pn = remain[0];
    const negate = !!this.minimatch.negate;
    const rawGlob = pn._glob;
    const dotOk = this.dot || rawGlob.charAt(0) === ".";

    const matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        let m;
        if (negate && !prefix) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m) matchedEntries.push(e);
      }
    }

    //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

    const len = matchedEntries.length;
    // If there are no matched entries, then nothing matches.
    if (len === 0) return cb();

    // if this is the last remaining pattern bit, then no need for
    // an additional stat *unless* the user has specified mark or
    // stat explicitly.  We know they exist, since readdir returned
    // them.

    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index]) this.matches[index] = Object.create(null);

      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix) {
          if (prefix !== "/") e = `${prefix}/${e}`;
          else e = prefix + e;
        }

        if (e.charAt(0) === "/" && !this.nomount) {
          e = path.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      // This was the last one, and no stats were needed
      return cb();
    }

    // now test all matched entries as stand-ins for that part
    // of the pattern.
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      let newPattern;
      if (prefix) {
        if (prefix !== "/") e = `${prefix}/${e}`;
        else e = prefix + e;
      }
      this._process([e].concat(remain), index, inGlobStar, cb);
    }
    cb();
  }

  _emitMatch(index, e) {
    if (this.aborted) return;

    if (isIgnored(this, e)) return;

    if (this.paused) {
      this._emitQueue.push([index, e]);
      return;
    }

    const abs = isAbsolute(e) ? e : this._makeAbs(e);

    if (this.mark) e = this._mark(e);

    if (this.absolute) e = abs;

    if (this.matches[index][e]) return;

    if (this.nodir) {
      const c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c)) return;
    }

    this.matches[index][e] = true;

    const st = this.statCache[abs];
    if (st) this.emit("stat", e, st);

    this.emit("match", e);
  }

  _readdirInGlobStar(abs, cb) {
    if (this.aborted) return;

    // follow all symlinked directories forever
    // just proceed as if this is a non-globstar situation
    if (this.follow) return this._readdir(abs, false, cb);

    const lstatkey = `lstat\0${abs}`;
    const self = this;
    const lstatcb = inflight(lstatkey, lstatcb_);

    if (lstatcb) fs.lstat(abs, lstatcb);

    function lstatcb_(er, lstat) {
      if (er && er.code === "ENOENT") return cb();

      const isSym = lstat && lstat.isSymbolicLink();
      self.symlinks[abs] = isSym;

      // If it's not a symlink or a dir, then it's definitely a regular file.
      // don't bother doing a readdir in that case.
      if (!isSym && lstat && !lstat.isDirectory()) {
        self.cache[abs] = "FILE";
        cb();
      } else self._readdir(abs, false, cb);
    }
  }

  _readdir(abs, inGlobStar, cb) {
    if (this.aborted) return;

    cb = inflight(`readdir\0${abs}\0${inGlobStar}`, cb);
    if (!cb) return;

    //console.error('RD %j %j', +inGlobStar, abs)
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs, cb);

    if (ownProp(this.cache, abs)) {
      const c = this.cache[abs];
      if (!c || c === "FILE") return cb();

      if (Array.isArray(c)) return cb(null, c);
    }

    const self = this;
    fs.readdir(abs, readdirCb(this, abs, cb));
  }

  _readdirEntries(abs, entries, cb) {
    if (this.aborted) return;

    // if we haven't asked to stat everything, then just
    // assume that everything in there exists, so we can avoid
    // having to stat it a second time.
    if (!this.mark && !this.stat) {
      for (let i = 0; i < entries.length; i++) {
        let e = entries[i];
        if (abs === "/") e = abs + e;
        else e = `${abs}/${e}`;
        this.cache[e] = true;
      }
    }

    this.cache[abs] = entries;
    return cb(null, entries);
  }

  _readdirError(f, er, cb) {
    if (this.aborted) return;

    // handle errors, and cache the information
    switch (er.code) {
      case "ENOTSUP": // https://github.com/isaacs/node-glob/issues/205
      case "ENOTDIR": // totally normal. means it *does* exist.
        const abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          const error = new Error(`${er.code} invalid cwd ${this.cwd}`);
          error.path = this.cwd;
          error.code = er.code;
          this.emit("error", error);
          this.abort();
        }
        break;

      case "ENOENT": // not terribly unusual
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;

      default:
        // some unusual error.  Treat as failure.
        this.cache[this._makeAbs(f)] = false;
        if (this.strict) {
          this.emit("error", er);
          // If the error is handled, then we abort
          // if not, we threw out of here
          this.abort();
        }
        if (!this.silent) console.error("glob error", er);
        break;
    }

    return cb();
  }

  _processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb) {
    const self = this;
    this._readdir(abs, inGlobStar, (er, entries) => {
      self._processGlobStar2(
        prefix,
        read,
        abs,
        remain,
        index,
        inGlobStar,
        entries,
        cb
      );
    });
  }

  _processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    //console.error('pgs2', prefix, remain[0], entries)

    // no entries means not a dir, so it can never have matches
    // foo.txt/** doesn't match foo.txt
    if (!entries) return cb();

    // test without the globstar, and with every child both below
    // and replacing the globstar.
    const remainWithoutGlobStar = remain.slice(1);
    const gspref = prefix ? [prefix] : [];
    const noGlobStar = gspref.concat(remainWithoutGlobStar);

    // the noGlobStar pattern exits the inGlobStar state
    this._process(noGlobStar, index, false, cb);

    const isSym = this.symlinks[abs];
    const len = entries.length;

    // If it's a symlink, and we're in a globstar, then stop
    if (isSym && inGlobStar) return cb();

    for (let i = 0; i < len; i++) {
      const e = entries[i];
      if (e.charAt(0) === "." && !this.dot) continue;

      // these two cases enter the inGlobStar state
      const instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true, cb);

      const below = gspref.concat(entries[i], remain);
      this._process(below, index, true, cb);
    }

    cb();
  }

  _processSimple(prefix, index, cb) {
    // XXX review this.  Shouldn't it be doing the mounting etc
    // before doing stat?  kinda weird?
    const self = this;
    this._stat(prefix, (er, exists) => {
      self._processSimple2(prefix, index, er, exists, cb);
    });
  }

  _processSimple2(prefix, index, er, exists, cb) {
    //console.error('ps2', prefix, exists)

    if (!this.matches[index]) this.matches[index] = Object.create(null);

    // If it doesn't exist, then just mark the lack of results
    if (!exists) return cb();

    if (prefix && isAbsolute(prefix) && !this.nomount) {
      const trail = /[\/\\]$/.test(prefix);
      if (prefix.charAt(0) === "/") {
        prefix = path.join(this.root, prefix);
      } else {
        prefix = path.resolve(this.root, prefix);
        if (trail) prefix += "/";
      }
    }

    if (process.platform === "win32") prefix = prefix.replace(/\\/g, "/");

    // Mark this as a match
    this._emitMatch(index, prefix);
    cb();
  }

  // Returns either 'DIR', 'FILE', or false
  _stat(f, cb) {
    const abs = this._makeAbs(f);
    const needDir = f.slice(-1) === "/";

    if (f.length > this.maxLength) return cb();

    if (!this.stat && ownProp(this.cache, abs)) {
      let c = this.cache[abs];

      if (Array.isArray(c)) c = "DIR";

      // It exists, but maybe not how we need it
      if (!needDir || c === "DIR") return cb(null, c);

      if (needDir && c === "FILE") return cb();

      // otherwise we have to stat, because maybe c=true
      // if we know it exists, but not what it is.
    }

    let exists;
    const stat = this.statCache[abs];
    if (stat !== undefined) {
      if (stat === false) return cb(null, stat);
      else {
        const type = stat.isDirectory() ? "DIR" : "FILE";
        if (needDir && type === "FILE") return cb();
        else return cb(null, type, stat);
      }
    }

    const self = this;
    const statcb = inflight(`stat\0${abs}`, lstatcb_);
    if (statcb) fs.lstat(abs, statcb);

    function lstatcb_(er, lstat) {
      if (lstat && lstat.isSymbolicLink()) {
        // If it's a symlink, then treat it as the target, unless
        // the target does not exist, then treat it as a file.
        return fs.stat(abs, (er, stat) => {
          if (er) self._stat2(f, abs, null, lstat, cb);
          else self._stat2(f, abs, er, stat, cb);
        });
      } else {
        self._stat2(f, abs, er, lstat, cb);
      }
    }
  }

  _stat2(f, abs, er, stat, cb) {
    if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
      this.statCache[abs] = false;
      return cb();
    }

    const needDir = f.slice(-1) === "/";
    this.statCache[abs] = stat;

    if (abs.slice(-1) === "/" && stat && !stat.isDirectory())
      return cb(null, false, stat);

    let c = true;
    if (stat) c = stat.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;

    if (needDir && c === "FILE") return cb();

    return cb(null, c, stat);
  }
}

function readdirCb(self, abs, cb) {
  return (er, entries) => {
    if (er) self._readdirError(abs, er, cb);
    else self._readdirEntries(abs, entries, cb);
  };
}
