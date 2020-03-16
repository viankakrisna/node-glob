export { alphasort };
export { alphasorti };
export { setopts };
export { ownProp };
export { makeAbs };
export { finish };
export { mark };
export { isIgnored };
export { childrenIgnored };

function ownProp(obj, field) {
  return Object.prototype.hasOwnProperty.call(obj, field);
}

import path from "path";
import minimatch from "minimatch";
import isAbsolute from "path-is-absolute";
const Minimatch = minimatch.Minimatch;

function alphasorti(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

function alphasort(a, b) {
  return a.localeCompare(b);
}

function setupIgnores(self, { ignore }) {
  self.ignore = ignore || [];

  if (!Array.isArray(self.ignore)) self.ignore = [self.ignore];

  if (self.ignore.length) {
    self.ignore = self.ignore.map(ignoreMap);
  }
}

// ignore patterns are always in dot:true mode.
function ignoreMap(pattern) {
  let gmatcher = null;
  if (pattern.slice(-3) === "/**") {
    const gpattern = pattern.replace(/(\/\*\*)+$/, "");
    gmatcher = new Minimatch(gpattern, { dot: true });
  }

  return {
    matcher: new Minimatch(pattern, { dot: true }),
    gmatcher
  };
}

function setopts(self, pattern, options) {
  if (!options) options = {};

  // base-matching: just use globstar for that.
  if (options.matchBase && !pattern.includes("/")) {
    if (options.noglobstar) {
      throw new Error("base matching requires globstar");
    }
    pattern = `**/${pattern}`;
  }

  self.silent = !!options.silent;
  self.pattern = pattern;
  self.strict = options.strict !== false;
  self.realpath = !!options.realpath;
  self.realpathCache = options.realpathCache || Object.create(null);
  self.follow = !!options.follow;
  self.dot = !!options.dot;
  self.mark = !!options.mark;
  self.nodir = !!options.nodir;
  if (self.nodir) self.mark = true;
  self.sync = !!options.sync;
  self.nounique = !!options.nounique;
  self.nonull = !!options.nonull;
  self.nosort = !!options.nosort;
  self.nocase = !!options.nocase;
  self.stat = !!options.stat;
  self.noprocess = !!options.noprocess;
  self.absolute = !!options.absolute;

  self.maxLength = options.maxLength || Infinity;
  self.cache = options.cache || Object.create(null);
  self.statCache = options.statCache || Object.create(null);
  self.symlinks = options.symlinks || Object.create(null);

  setupIgnores(self, options);

  self.changedCwd = false;
  const cwd = process.cwd();
  if (!ownProp(options, "cwd")) self.cwd = cwd;
  else {
    self.cwd = path.resolve(options.cwd);
    self.changedCwd = self.cwd !== cwd;
  }

  self.root = options.root || path.resolve(self.cwd, "/");
  self.root = path.resolve(self.root);
  if (process.platform === "win32") self.root = self.root.replace(/\\/g, "/");

  // TODO: is an absolute `cwd` supposed to be resolved against `root`?
  // e.g. { cwd: '/test', root: __dirname } === path.join(__dirname, '/test')
  self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd);
  if (process.platform === "win32")
    self.cwdAbs = self.cwdAbs.replace(/\\/g, "/");
  self.nomount = !!options.nomount;

  // disable comments and negation in Minimatch.
  // Note that they are not supported in Glob itself anyway.
  options.nonegate = true;
  options.nocomment = true;

  self.minimatch = new Minimatch(pattern, options);
  self.options = self.minimatch.options;
}

function finish(self) {
  const nou = self.nounique;
  let all = nou ? [] : Object.create(null);

  for (var i = 0, l = self.matches.length; i < l; i++) {
    const matches = self.matches[i];
    if (!matches || Object.keys(matches).length === 0) {
      if (self.nonull) {
        // do like the shell, and spit out the literal glob
        const literal = self.minimatch.globSet[i];
        if (nou) all.push(literal);
        else all[literal] = true;
      }
    } else {
      // had matches
      const m = Object.keys(matches);
      if (nou) all.push.apply(all, m);
      else
        m.forEach(m => {
          all[m] = true;
        });
    }
  }

  if (!nou) all = Object.keys(all);

  if (!self.nosort) all = all.sort(self.nocase ? alphasorti : alphasort);

  // at *some* point we statted all of these
  if (self.mark) {
    for (var i = 0; i < all.length; i++) {
      all[i] = self._mark(all[i]);
    }
    if (self.nodir) {
      all = all.filter(e => {
        let notDir = !/\/$/.test(e);
        const c = self.cache[e] || self.cache[makeAbs(self, e)];
        if (notDir && c) notDir = c !== "DIR" && !Array.isArray(c);
        return notDir;
      });
    }
  }

  if (self.ignore.length) all = all.filter(m => !isIgnored(self, m));

  self.found = all;
}

function mark(self, p) {
  const abs = makeAbs(self, p);
  const c = self.cache[abs];
  let m = p;
  if (c) {
    const isDir = c === "DIR" || Array.isArray(c);
    const slash = p.slice(-1) === "/";

    if (isDir && !slash) m += "/";
    else if (!isDir && slash) m = m.slice(0, -1);

    if (m !== p) {
      const mabs = makeAbs(self, m);
      self.statCache[mabs] = self.statCache[abs];
      self.cache[mabs] = self.cache[abs];
    }
  }

  return m;
}

// lotta situps...
function makeAbs({ root, changedCwd, cwd }, f) {
  let abs = f;
  if (f.charAt(0) === "/") {
    abs = path.join(root, f);
  } else if (isAbsolute(f) || f === "") {
    abs = f;
  } else if (changedCwd) {
    abs = path.resolve(cwd, f);
  } else {
    abs = path.resolve(f);
  }

  if (process.platform === "win32") abs = abs.replace(/\\/g, "/");

  return abs;
}

// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
function isIgnored({ ignore }, path) {
  if (!ignore.length) return false;

  return ignore.some(
    ({ matcher, gmatcher }) =>
      matcher.match(path) || !!(gmatcher && gmatcher.match(path))
  );
}

function childrenIgnored({ ignore }, path) {
  if (!ignore.length) return false;

  return ignore.some(({ gmatcher }) => !!(gmatcher && gmatcher.match(path)));
}
