export default globSync;
globSync.GlobSync = GlobSync;

import fs from "fs";
import rp from "fs.realpath";
import minimatch from "minimatch";
const Minimatch = minimatch.Minimatch;
import glob from "./glob.js";
import util from "util";
import path from "path";
import assert from "assert";
import isAbsolute from "path-is-absolute";
import * as common from "./common.js";
const alphasort = common.alphasort;
const alphasorti = common.alphasorti;
const setopts = common.setopts;
const ownProp = common.ownProp;
const childrenIgnored = common.childrenIgnored;
const isIgnored = common.isIgnored;

function globSync(pattern, options) {
  if (typeof options === "function" || arguments.length === 3)
    throw new TypeError(
      "callback provided to sync glob\n" +
        "See: https://github.com/isaacs/node-glob/issues/167"
    );

  return new GlobSync(pattern, options).found;
}

class GlobSync {
  constructor(pattern, options) {
    if (!pattern) throw new Error("must provide pattern");

    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError(
        "callback provided to sync glob\n" +
          "See: https://github.com/isaacs/node-glob/issues/167"
      );

    if (!(this instanceof GlobSync)) return new GlobSync(pattern, options);

    setopts(this, pattern, options);

    if (this.noprocess) return this;

    const n = this.minimatch.set.length;
    this.matches = new Array(n);
    for (let i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false);
    }
    this._finish();
  }

  _finish() {
    assert(this instanceof GlobSync);
    if (this.realpath) {
      const self = this;
      this.matches.forEach((matchset, index) => {
        const set = (self.matches[index] = Object.create(null));
        for (let p in matchset) {
          try {
            p = self._makeAbs(p);
            const real = rp.realpathSync(p, self.realpathCache);
            set[real] = true;
          } catch (er) {
            if (er.syscall === "stat") set[self._makeAbs(p)] = true;
            else throw er;
          }
        }
      });
    }
    common.finish(this);
  }

  _process(pattern, index, inGlobStar) {
    assert(this instanceof GlobSync);

    // Get the first [n] parts of pattern that are all strings.
    let n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    // now n is the index of the first one that is *not* a string.

    // See if there's anything else
    let prefix;
    switch (n) {
      // if not, then this is rather simple
      case pattern.length:
        this._processSimple(pattern.join("/"), index);
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

    //if ignored, skip processing
    if (childrenIgnored(this, read)) return;

    const isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
    else this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
  }

  _processReaddir(prefix, read, abs, remain, index, inGlobStar) {
    const entries = this._readdir(abs, inGlobStar);

    // if the abs isn't a dir, then nothing can match!
    if (!entries) return;

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

    const len = matchedEntries.length;
    // If there are no matched entries, then nothing matches.
    if (len === 0) return;

    // if this is the last remaining pattern bit, then no need for
    // an additional stat *unless* the user has specified mark or
    // stat explicitly.  We know they exist, since readdir returned
    // them.

    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index]) this.matches[index] = Object.create(null);

      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix) {
          if (prefix.slice(-1) !== "/") e = `${prefix}/${e}`;
          else e = prefix + e;
        }

        if (e.charAt(0) === "/" && !this.nomount) {
          e = path.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      // This was the last one, and no stats were needed
      return;
    }

    // now test all matched entries as stand-ins for that part
    // of the pattern.
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      let newPattern;
      if (prefix) newPattern = [prefix, e];
      else newPattern = [e];
      this._process(newPattern.concat(remain), index, inGlobStar);
    }
  }

  _emitMatch(index, e) {
    if (isIgnored(this, e)) return;

    const abs = this._makeAbs(e);

    if (this.mark) e = this._mark(e);

    if (this.absolute) {
      e = abs;
    }

    if (this.matches[index][e]) return;

    if (this.nodir) {
      const c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c)) return;
    }

    this.matches[index][e] = true;

    if (this.stat) this._stat(e);
  }

  _readdirInGlobStar(abs) {
    // follow all symlinked directories forever
    // just proceed as if this is a non-globstar situation
    if (this.follow) return this._readdir(abs, false);

    let entries;
    let lstat;
    let stat;
    try {
      lstat = fs.lstatSync(abs);
    } catch (er) {
      if (er.code === "ENOENT") {
        // lstat failed, doesn't exist
        return null;
      }
    }

    const isSym = lstat && lstat.isSymbolicLink();
    this.symlinks[abs] = isSym;

    // If it's not a symlink or a dir, then it's definitely a regular file.
    // don't bother doing a readdir in that case.
    if (!isSym && lstat && !lstat.isDirectory()) this.cache[abs] = "FILE";
    else entries = this._readdir(abs, false);

    return entries;
  }

  _readdir(abs, inGlobStar) {
    let entries;

    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs);

    if (ownProp(this.cache, abs)) {
      const c = this.cache[abs];
      if (!c || c === "FILE") return null;

      if (Array.isArray(c)) return c;
    }

    try {
      return this._readdirEntries(abs, fs.readdirSync(abs));
    } catch (er) {
      this._readdirError(abs, er);
      return null;
    }
  }

  _readdirEntries(abs, entries) {
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

    // mark and cache dir-ness
    return entries;
  }

  _readdirError(f, er) {
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
          throw error;
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
        if (this.strict) throw er;
        if (!this.silent) console.error("glob error", er);
        break;
    }
  }

  _processGlobStar(prefix, read, abs, remain, index, inGlobStar) {
    const entries = this._readdir(abs, inGlobStar);

    // no entries means not a dir, so it can never have matches
    // foo.txt/** doesn't match foo.txt
    if (!entries) return;

    // test without the globstar, and with every child both below
    // and replacing the globstar.
    const remainWithoutGlobStar = remain.slice(1);
    const gspref = prefix ? [prefix] : [];
    const noGlobStar = gspref.concat(remainWithoutGlobStar);

    // the noGlobStar pattern exits the inGlobStar state
    this._process(noGlobStar, index, false);

    const len = entries.length;
    const isSym = this.symlinks[abs];

    // If it's a symlink, and we're in a globstar, then stop
    if (isSym && inGlobStar) return;

    for (let i = 0; i < len; i++) {
      const e = entries[i];
      if (e.charAt(0) === "." && !this.dot) continue;

      // these two cases enter the inGlobStar state
      const instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true);

      const below = gspref.concat(entries[i], remain);
      this._process(below, index, true);
    }
  }

  _processSimple(prefix, index) {
    // XXX review this.  Shouldn't it be doing the mounting etc
    // before doing stat?  kinda weird?
    const exists = this._stat(prefix);

    if (!this.matches[index]) this.matches[index] = Object.create(null);

    // If it doesn't exist, then just mark the lack of results
    if (!exists) return;

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
  }

  // Returns either 'DIR', 'FILE', or false
  _stat(f) {
    const abs = this._makeAbs(f);
    const needDir = f.slice(-1) === "/";

    if (f.length > this.maxLength) return false;

    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];

      if (Array.isArray(c)) c = "DIR";

      // It exists, but maybe not how we need it
      if (!needDir || c === "DIR") return c;

      if (needDir && c === "FILE") return false;

      // otherwise we have to stat, because maybe c=true
      // if we know it exists, but not what it is.
    }

    let exists;
    let stat = this.statCache[abs];
    if (!stat) {
      let lstat;
      try {
        lstat = fs.lstatSync(abs);
      } catch (er) {
        if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
          this.statCache[abs] = false;
          return false;
        }
      }

      if (lstat && lstat.isSymbolicLink()) {
        try {
          stat = fs.statSync(abs);
        } catch (er) {
          stat = lstat;
        }
      } else {
        stat = lstat;
      }
    }

    this.statCache[abs] = stat;

    var c = true;
    if (stat) c = stat.isDirectory() ? "DIR" : "FILE";

    this.cache[abs] = this.cache[abs] || c;

    if (needDir && c === "FILE") return false;

    return c;
  }

  _mark(p) {
    return common.mark(this, p);
  }

  _makeAbs(f) {
    return common.makeAbs(this, f);
  }
}
