function t(t){return t&&"object"==typeof t&&"default"in t?t.default:t}var e=require("events"),r=t(require("fs")),n=t(require("assert")),i=t(require("path"));require("util");var s="win32"===process.platform,o=process.env.NODE_DEBUG&&/fs/.test(process.env.NODE_DEBUG);if(s)var a=/(.*?)(?:[\/\\]+|$)/g;else a=/(.*?)(?:[\/]+|$)/g;if(s)var c=/^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;else c=/^[\/]*/;var h={realpathSync:function(t,e){if(t=i.resolve(t),e&&Object.prototype.hasOwnProperty.call(e,t))return e[t];var n,o,h,u,l=t,f={},p={};function d(){var e=c.exec(t);n=e[0].length,o=e[0],h=e[0],u="",s&&!p[h]&&(r.lstatSync(h),p[h]=!0)}for(d();n<t.length;){a.lastIndex=n;var g=a.exec(t);if(u=o,o+=g[0],n=a.lastIndex,!(p[h=u+g[1]]||e&&e[h]===h)){var m;if(e&&Object.prototype.hasOwnProperty.call(e,h))m=e[h];else{var v=r.lstatSync(h);if(!v.isSymbolicLink()){p[h]=!0,e&&(e[h]=h);continue}var y=null;if(!s){var b=v.dev.toString(32)+":"+v.ino.toString(32);f.hasOwnProperty(b)&&(y=f[b])}null===y&&(r.statSync(h),y=r.readlinkSync(h)),m=i.resolve(u,y),e&&(e[h]=m),s||(f[b]=y)}t=i.resolve(m,t.slice(n)),d()}}return e&&(e[l]=t),t},realpath:function(t,e,n){if("function"!=typeof n&&(n="function"==typeof e?e:function(){var t;if(o){var e=new Error;t=function(t){t&&(e.message=t.message,r(t=e))}}else t=r;return t;function r(t){if(t){if(process.throwDeprecation)throw t;if(!process.noDeprecation){var e="fs: missing callback "+(t.stack||t.message);process.traceDeprecation?console.trace(e):console.error(e)}}}}(),e=null),t=i.resolve(t),e&&Object.prototype.hasOwnProperty.call(e,t))return process.nextTick(n.bind(null,null,e[t]));var h,u,l,f,p=t,d={},g={};function m(){var e=c.exec(t);h=e[0].length,u=e[0],l=e[0],f="",s&&!g[l]?r.lstat(l,function(t){if(t)return n(t);g[l]=!0,v()}):process.nextTick(v)}function v(){if(h>=t.length)return e&&(e[p]=t),n(null,t);a.lastIndex=h;var i=a.exec(t);return f=u,u+=i[0],h=a.lastIndex,g[l=f+i[1]]||e&&e[l]===l?process.nextTick(v):e&&Object.prototype.hasOwnProperty.call(e,l)?_(e[l]):r.lstat(l,y)}function y(t,i){if(t)return n(t);if(!i.isSymbolicLink())return g[l]=!0,e&&(e[l]=l),process.nextTick(v);if(!s){var o=i.dev.toString(32)+":"+i.ino.toString(32);if(d.hasOwnProperty(o))return b(null,d[o],l)}r.stat(l,function(t){if(t)return n(t);r.readlink(l,function(t,e){s||(d[o]=e),b(t,e)})})}function b(t,r,s){if(t)return n(t);var o=i.resolve(f,r);e&&(e[s]=o),_(o)}function _(e){t=i.resolve(e,t.slice(h)),m()}m()}},u=m;m.realpath=m,m.sync=v,m.realpathSync=v,m.monkeypatch=function(){r.realpath=m,r.realpathSync=v},m.unmonkeypatch=function(){r.realpath=l,r.realpathSync=f};var l=r.realpath,f=r.realpathSync,p=process.version,d=/^v[0-5]\./.test(p);function g(t){return t&&"realpath"===t.syscall&&("ELOOP"===t.code||"ENOMEM"===t.code||"ENAMETOOLONG"===t.code)}function m(t,e,r){if(d)return l(t,e,r);"function"==typeof e&&(r=e,e=null),l(t,e,function(n,i){g(n)?h.realpath(t,e,r):r(n,i)})}function v(t,e){if(d)return f(t,e);try{return f(t,e)}catch(r){if(g(r))return h.realpathSync(t,e);throw r}}var y=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},b=_;function _(t,e,r){t instanceof RegExp&&(t=w(t,r)),e instanceof RegExp&&(e=w(e,r));var n=E(t,e,r);return n&&{start:n[0],end:n[1],pre:r.slice(0,n[0]),body:r.slice(n[0]+t.length,n[1]),post:r.slice(n[1]+e.length)}}function w(t,e){var r=e.match(t);return r?r[0]:null}function E(t,e,r){var n,i,s,o,a,c=r.indexOf(t),h=r.indexOf(e,c+1),u=c;if(c>=0&&h>0){for(n=[],s=r.length;u>=0&&!a;)u==c?(n.push(u),c=r.indexOf(t,u+1)):1==n.length?a=[n.pop(),h]:((i=n.pop())<s&&(s=i,o=h),h=r.indexOf(e,u+1)),u=c<h&&c>=0?c:h;n.length&&(a=[s,o])}return a}_.range=E;var O=function(t){return t?("{}"===t.substr(0,2)&&(t="\\{\\}"+t.substr(2)),function t(e,r){var n=[],i=b("{","}",e);if(!i||/\$$/.test(i.pre))return[e];var s,o=/^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(i.body),a=/^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(i.body),c=o||a,h=i.body.indexOf(",")>=0;if(!c&&!h)return i.post.match(/,.*\}/)?t(e=i.pre+"{"+i.body+S+i.post):[e];if(c)s=i.body.split(/\.\./);else if(1===(s=function t(e){if(!e)return[""];var r=[],n=b("{","}",e);if(!n)return e.split(",");var i=n.body,s=n.post,o=n.pre.split(",");o[o.length-1]+="{"+i+"}";var a=t(s);return s.length&&(o[o.length-1]+=a.shift(),o.push.apply(o,a)),r.push.apply(r,o),r}(i.body)).length&&1===(s=t(s[0],!1).map(R)).length)return(f=i.post.length?t(i.post,!1):[""]).map(function(t){return i.pre+s[0]+t});var u,l=i.pre,f=i.post.length?t(i.post,!1):[""];if(c){var p=I(s[0]),d=I(s[1]),g=Math.max(s[0].length,s[1].length),m=3==s.length?Math.abs(I(s[2])):1,v=T;d<p&&(m*=-1,v=C);var _=s.some(N);u=[];for(var w=p;v(w,d);w+=m){var E;if(a)"\\"===(E=String.fromCharCode(w))&&(E="");else if(E=String(w),_){var O=g-E.length;if(O>0){var k=new Array(O+1).join("0");E=w<0?"-"+k+E.slice(1):k+E}}u.push(E)}}else u=function(e,r){for(var n=[],i=0;i<e.length;i++){var s=t(e[i],!1);y(s)?n.push.apply(n,s):n.push(s)}return n}(s);for(var A=0;A<u.length;A++)for(var j=0;j<f.length;j++){var x=l+u[A]+f[j];(!r||c||x)&&n.push(x)}return n}(function(t){return t.split("\\\\").join(k).split("\\{").join(A).split("\\}").join(S).split("\\,").join(j).split("\\.").join(x)}(t),!0).map(L)):[]},k="\0SLASH"+Math.random()+"\0",A="\0OPEN"+Math.random()+"\0",S="\0CLOSE"+Math.random()+"\0",j="\0COMMA"+Math.random()+"\0",x="\0PERIOD"+Math.random()+"\0";function I(t){return parseInt(t,10)==t?parseInt(t,10):t.charCodeAt(0)}function L(t){return t.split(k).join("\\").split(A).join("{").split(S).join("}").split(j).join(",").split(x).join(".")}function R(t){return"{"+t+"}"}function N(t){return/^-?0\d/.test(t)}function T(t,e){return t<=e}function C(t,e){return t>=e}var D=U;U.Minimatch=z;var M={sep:"/"};try{M=i}catch(t){}var G=U.GLOBSTAR=z.GLOBSTAR={},$={"!":{open:"(?:(?!(?:",close:"))[^/]*?)"},"?":{open:"(?:",close:")?"},"+":{open:"(?:",close:")+"},"*":{open:"(?:",close:")*"},"@":{open:"(?:",close:")"}},P="[^/]",F=P+"*?",q="().*{}+?[]^$\\!".split("").reduce(function(t,e){return t[e]=!0,t},{}),B=/\/+/;function Q(t,e){t=t||{},e=e||{};var r={};return Object.keys(e).forEach(function(t){r[t]=e[t]}),Object.keys(t).forEach(function(e){r[e]=t[e]}),r}function U(t,e,r){if("string"!=typeof e)throw new TypeError("glob pattern string required");return r||(r={}),!(!r.nocomment&&"#"===e.charAt(0))&&(""===e.trim()?""===t:new z(e,r).match(t))}function z(t,e){if(!(this instanceof z))return new z(t,e);if("string"!=typeof t)throw new TypeError("glob pattern string required");e||(e={}),t=t.trim(),"/"!==M.sep&&(t=t.split(M.sep).join("/")),this.options=e,this.set=[],this.pattern=t,this.regexp=null,this.negate=!1,this.comment=!1,this.empty=!1,this.make()}function Z(t,e){if(e||(e=this instanceof z?this.options:{}),void 0===(t=void 0===t?this.pattern:t))throw new TypeError("undefined pattern");return e.nobrace||!t.match(/\{.*\}/)?[t]:O(t)}U.filter=function(t,e){return e=e||{},function(r,n,i){return U(r,t,e)}},U.defaults=function(t){if(!t||!Object.keys(t).length)return U;var e=U,r=function(r,n,i){return e.minimatch(r,n,Q(t,i))};return r.Minimatch=function(r,n){return new e.Minimatch(r,Q(t,n))},r},z.defaults=function(t){return t&&Object.keys(t).length?U.defaults(t).Minimatch:z},z.prototype.debug=function(){},z.prototype.make=function(){if(!this._made){var t=this.pattern,e=this.options;if(e.nocomment||"#"!==t.charAt(0))if(t){this.parseNegate();var r=this.globSet=this.braceExpand();e.debug&&(this.debug=console.error),this.debug(this.pattern,r),r=this.globParts=r.map(function(t){return t.split(B)}),this.debug(this.pattern,r),r=r.map(function(t,e,r){return t.map(this.parse,this)},this),this.debug(this.pattern,r),r=r.filter(function(t){return-1===t.indexOf(!1)}),this.debug(this.pattern,r),this.set=r}else this.empty=!0;else this.comment=!0}},z.prototype.parseNegate=function(){var t=this.pattern,e=!1,r=0;if(!this.options.nonegate){for(var n=0,i=t.length;n<i&&"!"===t.charAt(n);n++)e=!e,r++;r&&(this.pattern=t.substr(r)),this.negate=e}},U.braceExpand=function(t,e){return Z(t,e)},z.prototype.braceExpand=Z,z.prototype.parse=function(t,e){if(t.length>65536)throw new TypeError("pattern is too long");var r=this.options;if(!r.noglobstar&&"**"===t)return G;if(""===t)return"";var n,i="",s=!!r.nocase,o=!1,a=[],c=[],h=!1,u=-1,l=-1,f="."===t.charAt(0)?"":r.dot?"(?!(?:^|\\/)\\.{1,2}(?:$|\\/))":"(?!\\.)",p=this;function d(){if(n){switch(n){case"*":i+=F,s=!0;break;case"?":i+=P,s=!0;break;default:i+="\\"+n}p.debug("clearStateChar %j %j",n,i),n=!1}}for(var g,m=0,v=t.length;m<v&&(g=t.charAt(m));m++)if(this.debug("%s\t%s %s %j",t,m,i,g),o&&q[g])i+="\\"+g,o=!1;else switch(g){case"/":return!1;case"\\":d(),o=!0;continue;case"?":case"*":case"+":case"@":case"!":if(this.debug("%s\t%s %s %j <-- stateChar",t,m,i,g),h){this.debug("  in class"),"!"===g&&m===l+1&&(g="^"),i+=g;continue}p.debug("call clearStateChar %j",n),d(),n=g,r.noext&&d();continue;case"(":if(h){i+="(";continue}if(!n){i+="\\(";continue}a.push({type:n,start:m-1,reStart:i.length,open:$[n].open,close:$[n].close}),this.debug("plType %j %j",n,i+="!"===n?"(?:(?!(?:":"(?:"),n=!1;continue;case")":if(h||!a.length){i+="\\)";continue}d(),s=!0;var y=a.pop();i+=y.close,"!"===y.type&&c.push(y),y.reEnd=i.length;continue;case"|":if(h||!a.length||o){i+="\\|",o=!1;continue}d(),i+="|";continue;case"[":if(d(),h){i+="\\"+g;continue}h=!0,l=m,u=i.length,i+=g;continue;case"]":if(m===l+1||!h){i+="\\"+g,o=!1;continue}if(h)var b,_=t.substring(l+1,m);s=!0,h=!1,i+=g;continue;default:d(),o?o=!1:!q[g]||"^"===g&&h||(i+="\\"),i+=g}for(h&&(_=t.substr(l+1),b=this.parse(_,K),i=i.substr(0,u)+"\\["+b[0],s=s||b[1]),y=a.pop();y;y=a.pop()){var w=i.slice(y.reStart+y.open.length);this.debug("setting tail",i,y),w=w.replace(/((?:\\{2}){0,64})(\\?)\|/g,function(t,e,r){return r||(r="\\"),e+e+r+"|"}),this.debug("tail=%j\n   %s",w,w,y,i);var E="*"===y.type?F:"?"===y.type?P:"\\"+y.type;s=!0,i=i.slice(0,y.reStart)+E+"\\("+w}d(),o&&(i+="\\\\");var O=!1;switch(i.charAt(0)){case".":case"[":case"(":O=!0}for(var k=c.length-1;k>-1;k--){var A=c[k],S=i.slice(0,A.reStart),j=i.slice(A.reStart,A.reEnd-8),x=i.slice(A.reEnd-8,A.reEnd),I=i.slice(A.reEnd);x+=I;var L=S.split("(").length-1,R=I;for(m=0;m<L;m++)R=R.replace(/\)[+*?]?/,"");var N="";""===(I=R)&&e!==K&&(N="$"),i=S+j+I+N+x}if(""!==i&&s&&(i="(?=.)"+i),O&&(i=f+i),e===K)return[i,s];if(!s)return t.replace(/\\(.)/g,"$1");var T=r.nocase?"i":"";try{var C=new RegExp("^"+i+"$",T)}catch(t){return new RegExp("$.")}return C._glob=t,C._src=i,C};var K={};U.makeRe=function(t,e){return new z(t,e||{}).makeRe()},z.prototype.makeRe=function(){if(this.regexp||!1===this.regexp)return this.regexp;var t=this.set;if(!t.length)return this.regexp=!1,this.regexp;var e=this.options,r=e.noglobstar?F:e.dot?"(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?":"(?:(?!(?:\\/|^)\\.).)*?",n=e.nocase?"i":"",i=t.map(function(t){return t.map(function(t){return t===G?r:"string"==typeof t?t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"):t._src}).join("\\/")}).join("|");i="^(?:"+i+")$",this.negate&&(i="^(?!"+i+").*$");try{this.regexp=new RegExp(i,n)}catch(t){this.regexp=!1}return this.regexp},U.match=function(t,e,r){var n=new z(e,r=r||{});return t=t.filter(function(t){return n.match(t)}),n.options.nonull&&!t.length&&t.push(e),t},z.prototype.match=function(t,e){if(this.debug("match",t,this.pattern),this.comment)return!1;if(this.empty)return""===t;if("/"===t&&e)return!0;var r=this.options;"/"!==M.sep&&(t=t.split(M.sep).join("/")),t=t.split(B),this.debug(this.pattern,"split",t);var n,i,s=this.set;for(this.debug(this.pattern,"set",s),i=t.length-1;i>=0&&!(n=t[i]);i--);for(i=0;i<s.length;i++){var o=s[i],a=t;if(r.matchBase&&1===o.length&&(a=[n]),this.matchOne(a,o,e))return!!r.flipNegate||!this.negate}return!r.flipNegate&&this.negate},z.prototype.matchOne=function(t,e,r){var n=this.options;this.debug("matchOne",{this:this,file:t,pattern:e}),this.debug("matchOne",t.length,e.length);for(var i=0,s=0,o=t.length,a=e.length;i<o&&s<a;i++,s++){this.debug("matchOne loop");var c,h=e[s],u=t[i];if(this.debug(e,h,u),!1===h)return!1;if(h===G){this.debug("GLOBSTAR",[e,h,u]);var l=i,f=s+1;if(f===a){for(this.debug("** at the end");i<o;i++)if("."===t[i]||".."===t[i]||!n.dot&&"."===t[i].charAt(0))return!1;return!0}for(;l<o;){var p=t[l];if(this.debug("\nglobstar while",t,l,e,f,p),this.matchOne(t.slice(l),e.slice(f),r))return this.debug("globstar found match!",l,o,p),!0;if("."===p||".."===p||!n.dot&&"."===p.charAt(0)){this.debug("dot detected!",t,l,e,f);break}this.debug("globstar swallow a segment, and continue"),l++}return!(!r||(this.debug("\n>>> no match, partial?",t,l,e,f),l!==o))}if("string"==typeof h?(c=n.nocase?u.toLowerCase()===h.toLowerCase():u===h,this.debug("string match",h,u,c)):(c=u.match(h),this.debug("pattern match",h,u,c)),!c)return!1}if(i===o&&s===a)return!0;if(i===o)return r;if(s===a)return i===o-1&&""===t[i];throw new Error("wtf?")};var W=function(t,e){return function(t){t.exports="function"==typeof Object.create?function(t,e){e&&(t.super_=e,t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}))}:function(t,e){if(e){t.super_=e;var r=function(){};r.prototype=e.prototype,t.prototype=new r,t.prototype.constructor=t}}}(e={exports:{}}),e.exports}();function H(t){return"/"===t.charAt(0)}function J(t){var e=/^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/.exec(t),r=e[1]||"",n=Boolean(r&&":"!==r.charAt(1));return Boolean(e[2]||n)}var V="win32"===process.platform?J:H,X=J;function Y(t,e){return Object.prototype.hasOwnProperty.call(t,e)}V.posix=H,V.win32=X;var tt=D.Minimatch;function et(t,e){return t.toLowerCase().localeCompare(e.toLowerCase())}function rt(t,e){return t.localeCompare(e)}function nt(t){var e=null;if("/**"===t.slice(-3)){var r=t.replace(/(\/\*\*)+$/,"");e=new tt(r,{dot:!0})}return{matcher:new tt(t,{dot:!0}),gmatcher:e}}function it(t,e,r){if(r||(r={}),r.matchBase&&!e.includes("/")){if(r.noglobstar)throw new Error("base matching requires globstar");e="**/"+e}t.silent=!!r.silent,t.pattern=e,t.strict=!1!==r.strict,t.realpath=!!r.realpath,t.realpathCache=r.realpathCache||Object.create(null),t.follow=!!r.follow,t.dot=!!r.dot,t.mark=!!r.mark,t.nodir=!!r.nodir,t.nodir&&(t.mark=!0),t.sync=!!r.sync,t.nounique=!!r.nounique,t.nonull=!!r.nonull,t.nosort=!!r.nosort,t.nocase=!!r.nocase,t.stat=!!r.stat,t.noprocess=!!r.noprocess,t.absolute=!!r.absolute,t.maxLength=r.maxLength||Infinity,t.cache=r.cache||Object.create(null),t.statCache=r.statCache||Object.create(null),t.symlinks=r.symlinks||Object.create(null),function(t,e){t.ignore=r.ignore||[],Array.isArray(t.ignore)||(t.ignore=[t.ignore]),t.ignore.length&&(t.ignore=t.ignore.map(nt))}(t),t.changedCwd=!1;var n=process.cwd();Y(r,"cwd")?(t.cwd=i.resolve(r.cwd),t.changedCwd=t.cwd!==n):t.cwd=n,t.root=r.root||i.resolve(t.cwd,"/"),t.root=i.resolve(t.root),"win32"===process.platform&&(t.root=t.root.replace(/\\/g,"/")),t.cwdAbs=V(t.cwd)?t.cwd:at(t,t.cwd),"win32"===process.platform&&(t.cwdAbs=t.cwdAbs.replace(/\\/g,"/")),t.nomount=!!r.nomount,r.nonegate=!0,r.nocomment=!0,t.minimatch=new tt(e,r),t.options=t.minimatch.options}function st(t){for(var e=t.nounique,r=e?[]:Object.create(null),n=0,i=t.matches.length;n<i;n++){var s=t.matches[n];if(s&&0!==Object.keys(s).length){var o=Object.keys(s);e?r.push.apply(r,o):o.forEach(function(t){r[t]=!0})}else if(t.nonull){var a=t.minimatch.globSet[n];e?r.push(a):r[a]=!0}}if(e||(r=Object.keys(r)),t.nosort||(r=r.sort(t.nocase?et:rt)),t.mark){for(n=0;n<r.length;n++)r[n]=t._mark(r[n]);t.nodir&&(r=r.filter(function(e){var r=!/\/$/.test(e),n=t.cache[e]||t.cache[at(t,e)];return r&&n&&(r="DIR"!==n&&!Array.isArray(n)),r}))}t.ignore.length&&(r=r.filter(function(e){return!ct(t,e)})),t.found=r}function ot(t,e){var r=at(t,e),n=t.cache[r],i=e;if(n){var s="DIR"===n||Array.isArray(n),o="/"===e.slice(-1);if(s&&!o?i+="/":!s&&o&&(i=i.slice(0,-1)),i!==e){var a=at(t,i);t.statCache[a]=t.statCache[r],t.cache[a]=t.cache[r]}}return i}function at(t,e){var r=t.root,n=t.changedCwd,s=t.cwd,o=e;return o="/"===e.charAt(0)?i.join(r,e):V(e)||""===e?e:n?i.resolve(s,e):i.resolve(e),"win32"===process.platform&&(o=o.replace(/\\/g,"/")),o}function ct(t,e){var r=t.ignore;return!!r.length&&r.some(function(t){var r=t.gmatcher;return t.matcher.match(e)||!(!r||!r.match(e))})}function ht(t,e){var r=t.ignore;return!!r.length&&r.some(function(t){var r=t.gmatcher;return!(!r||!r.match(e))})}dt.GlobSync=gt;var ut=it,lt=Y,ft=ht,pt=ct;function dt(t,e){if("function"==typeof e||3===arguments.length)throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");return new gt(t,e).found}var gt=function t(e,r){if(!e)throw new Error("must provide pattern");if("function"==typeof r||3===arguments.length)throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");if(!(this instanceof t))return new t(e,r);if(ut(this,e,r),this.noprocess)return this;var n=this.minimatch.set.length;this.matches=new Array(n);for(var i=0;i<n;i++)this._process(this.minimatch.set[i],i,!1);this._finish()};gt.prototype._finish=function(){if(n(this instanceof gt),this.realpath){var t=this;this.matches.forEach(function(e,r){var n=t.matches[r]=Object.create(null);for(var i in e)try{i=t._makeAbs(i),n[u.realpathSync(i,t.realpathCache)]=!0}catch(e){if("stat"!==e.syscall)throw e;n[t._makeAbs(i)]=!0}})}st(this)},gt.prototype._process=function(t,e,r){n(this instanceof gt);for(var i,s=0;"string"==typeof t[s];)s++;switch(s){case t.length:return void this._processSimple(t.join("/"),e);case 0:i=null;break;default:i=t.slice(0,s).join("/")}var o,a=t.slice(s);null===i?o=".":V(i)||V(t.join("/"))?(i&&V(i)||(i="/"+i),o=i):o=i;var c=this._makeAbs(o);ft(this,o)||(a[0]===D.GLOBSTAR?this._processGlobStar(i,o,c,a,e,r):this._processReaddir(i,o,c,a,e,r))},gt.prototype._processReaddir=function(t,e,r,n,s,o){var a=this._readdir(r,o);if(a){for(var c=n[0],h=!!this.minimatch.negate,u=this.dot||"."===c._glob.charAt(0),l=[],f=0;f<a.length;f++)("."!==(d=a[f]).charAt(0)||u)&&(h&&!t?!d.match(c):d.match(c))&&l.push(d);var p=l.length;if(0!==p)if(1!==n.length||this.mark||this.stat)for(n.shift(),f=0;f<p;f++)d=l[f],this._process((t?[t,d]:[d]).concat(n),s,o);else for(this.matches[s]||(this.matches[s]=Object.create(null)),f=0;f<p;f++){var d=l[f];t&&(d="/"!==t.slice(-1)?t+"/"+d:t+d),"/"!==d.charAt(0)||this.nomount||(d=i.join(this.root,d)),this._emitMatch(s,d)}}},gt.prototype._emitMatch=function(t,e){if(!pt(this,e)){var r=this._makeAbs(e);if(this.mark&&(e=this._mark(e)),this.absolute&&(e=r),!this.matches[t][e]){if(this.nodir){var n=this.cache[r];if("DIR"===n||Array.isArray(n))return}this.matches[t][e]=!0,this.stat&&this._stat(e)}}},gt.prototype._readdirInGlobStar=function(t){if(this.follow)return this._readdir(t,!1);var e,n;try{n=r.lstatSync(t)}catch(t){if("ENOENT"===t.code)return null}var i=n&&n.isSymbolicLink();return this.symlinks[t]=i,i||!n||n.isDirectory()?e=this._readdir(t,!1):this.cache[t]="FILE",e},gt.prototype._readdir=function(t,e){if(e&&!lt(this.symlinks,t))return this._readdirInGlobStar(t);if(lt(this.cache,t)){var n=this.cache[t];if(!n||"FILE"===n)return null;if(Array.isArray(n))return n}try{return this._readdirEntries(t,r.readdirSync(t))}catch(e){return this._readdirError(t,e),null}},gt.prototype._readdirEntries=function(t,e){if(!this.mark&&!this.stat)for(var r=0;r<e.length;r++){var n=e[r];this.cache[n="/"===t?t+n:t+"/"+n]=!0}return this.cache[t]=e,e},gt.prototype._readdirError=function(t,e){switch(e.code){case"ENOTSUP":case"ENOTDIR":var r=this._makeAbs(t);if(this.cache[r]="FILE",r===this.cwdAbs){var n=new Error(e.code+" invalid cwd "+this.cwd);throw n.path=this.cwd,n.code=e.code,n}break;case"ENOENT":case"ELOOP":case"ENAMETOOLONG":case"UNKNOWN":this.cache[this._makeAbs(t)]=!1;break;default:if(this.cache[this._makeAbs(t)]=!1,this.strict)throw e;this.silent||console.error("glob error",e)}},gt.prototype._processGlobStar=function(t,e,r,n,i,s){var o=this._readdir(r,s);if(o){var a=n.slice(1),c=t?[t]:[],h=c.concat(a);this._process(h,i,!1);var u=o.length;if(!this.symlinks[r]||!s)for(var l=0;l<u;l++)if("."!==o[l].charAt(0)||this.dot){var f=c.concat(o[l],a);this._process(f,i,!0);var p=c.concat(o[l],n);this._process(p,i,!0)}}},gt.prototype._processSimple=function(t,e){var r=this._stat(t);if(this.matches[e]||(this.matches[e]=Object.create(null)),r){if(t&&V(t)&&!this.nomount){var n=/[\/\\]$/.test(t);"/"===t.charAt(0)?t=i.join(this.root,t):(t=i.resolve(this.root,t),n&&(t+="/"))}"win32"===process.platform&&(t=t.replace(/\\/g,"/")),this._emitMatch(e,t)}},gt.prototype._stat=function(t){var e=this._makeAbs(t),n="/"===t.slice(-1);if(t.length>this.maxLength)return!1;if(!this.stat&&lt(this.cache,e)){var i=this.cache[e];if(Array.isArray(i)&&(i="DIR"),!n||"DIR"===i)return i;if(n&&"FILE"===i)return!1}var s=this.statCache[e];if(!s){var o;try{o=r.lstatSync(e)}catch(t){if(t&&("ENOENT"===t.code||"ENOTDIR"===t.code))return this.statCache[e]=!1,!1}if(o&&o.isSymbolicLink())try{s=r.statSync(e)}catch(t){s=o}else s=o}return this.statCache[e]=s,i=!0,s&&(i=s.isDirectory()?"DIR":"FILE"),this.cache[e]=this.cache[e]||i,(!n||"FILE"!==i)&&i},gt.prototype._mark=function(t){return ot(this,t)},gt.prototype._makeAbs=function(t){return at(this,t)};var mt=function t(e,r){if(e&&r)return t(e)(r);if("function"!=typeof e)throw new TypeError("need wrapper function");return Object.keys(e).forEach(function(t){n[t]=e[t]}),n;function n(){for(var t=new Array(arguments.length),r=0;r<t.length;r++)t[r]=arguments[r];var n=e.apply(this,t),i=t[t.length-1];return"function"==typeof n&&n!==i&&Object.keys(i).forEach(function(t){n[t]=i[t]}),n}},vt=mt(bt),yt=mt(_t);function bt(t){var e=function(){return e.called?e.value:(e.called=!0,e.value=t.apply(this,arguments))};return e.called=!1,e}function _t(t){var e=function(){if(e.called)throw new Error(e.onceError);return e.called=!0,e.value=t.apply(this,arguments)};return e.onceError=(t.name||"Function wrapped with `once`")+" shouldn't be called more than once",e.called=!1,e}bt.proto=bt(function(){Object.defineProperty(Function.prototype,"once",{value:function(){return bt(this)},configurable:!0}),Object.defineProperty(Function.prototype,"onceStrict",{value:function(){return _t(this)},configurable:!0})}),vt.strict=yt;var wt=Object.create(null),Et=mt(function(t,e){return wt[t]?(wt[t].push(e),null):(wt[t]=[e],function(t){return vt(function e(){var r=wt[t],n=r.length,i=function(t){for(var e=t.length,r=[],n=0;n<e;n++)r[n]=t[n];return r}(arguments);try{for(var s=0;s<n;s++)r[s].apply(null,i)}finally{r.length>n?(r.splice(0,n),process.nextTick(function(){e.apply(null,i)})):delete wt[t]}})}(t))}),Ot=it,kt=Y,At=ht,St=ct;function jt(t,e,r){if("function"==typeof e&&(r=e,e={}),e||(e={}),e.sync){if(r)throw new TypeError("callback provided to sync glob");return dt(t,e)}return new It(t,e,r)}jt.sync=dt;var xt=jt.GlobSync=dt.GlobSync;jt.glob=jt,jt.hasMagic=function(t,e){var r=function(t,e){if(null===e||"object"!=typeof e)return t;for(var r=Object.keys(e),n=r.length;n--;)t[r[n]]=e[r[n]];return t}({},e);r.noprocess=!0;var n=new It(t,r).minimatch.set;if(!t)return!1;if(n.length>1)return!0;for(var i=0;i<n[0].length;i++)if("string"!=typeof n[0][i])return!0;return!1},jt.Glob=It,W(It,e.EventEmitter);var It=function t(e,r,n){if("function"==typeof r&&(n=r,r=null),r&&r.sync){if(n)throw new TypeError("callback provided to sync glob");return new xt(e,r)}if(!(this instanceof t))return new t(e,r,n);Ot(this,e,r),this._didRealPath=!1;var i=this.minimatch.set.length;this.matches=new Array(i),"function"==typeof n&&(n=vt(n),this.on("error",n),this.on("end",function(t){n(null,t)}));var s=this;if(this._processing=0,this._emitQueue=[],this._processQueue=[],this.paused=!1,this.noprocess)return this;if(0===i)return c();for(var o=!0,a=0;a<i;a++)this._process(this.minimatch.set[a],a,!1,c);function c(){--s._processing,s._processing<=0&&(o?process.nextTick(function(){s._finish()}):s._finish())}o=!1};It.prototype._finish=function(){if(n(this instanceof It),!this.aborted){if(this.realpath&&!this._didRealpath)return this._realpath();st(this),this.emit("end",this.found)}},It.prototype._realpath=function(){if(!this._didRealpath){this._didRealpath=!0;var t=this.matches.length;if(0===t)return this._finish();for(var e=this,r=0;r<this.matches.length;r++)this._realpathSet(r,n)}function n(){0==--t&&e._finish()}},It.prototype._realpathSet=function(t,e){var r=this.matches[t];if(!r)return e();var n=Object.keys(r),i=this,s=n.length;if(0===s)return e();var o=this.matches[t]=Object.create(null);n.forEach(function(r,n){r=i._makeAbs(r),u.realpath(r,i.realpathCache,function(n,a){n?"stat"===n.syscall?o[r]=!0:i.emit("error",n):o[a]=!0,0==--s&&(i.matches[t]=o,e())})})},It.prototype._mark=function(t){return ot(this,t)},It.prototype._makeAbs=function(t){return at(this,t)},It.prototype.abort=function(){this.aborted=!0,this.emit("abort")},It.prototype.pause=function(){this.paused||(this.paused=!0,this.emit("pause"))},It.prototype.resume=function(){if(this.paused){if(this.emit("resume"),this.paused=!1,this._emitQueue.length){var t=this._emitQueue.slice(0);this._emitQueue.length=0;for(var e=0;e<t.length;e++){var r=t[e];this._emitMatch(r[0],r[1])}}if(this._processQueue.length){var n=this._processQueue.slice(0);for(this._processQueue.length=0,e=0;e<n.length;e++){var i=n[e];this._processing--,this._process(i[0],i[1],i[2],i[3])}}}},It.prototype._process=function(t,e,r,i){if(n(this instanceof It),n("function"==typeof i),!this.aborted)if(this._processing++,this.paused)this._processQueue.push([t,e,r,i]);else{for(var s,o=0;"string"==typeof t[o];)o++;switch(o){case t.length:return void this._processSimple(t.join("/"),e,i);case 0:s=null;break;default:s=t.slice(0,o).join("/")}var a,c=t.slice(o);null===s?a=".":V(s)||V(t.join("/"))?(s&&V(s)||(s="/"+s),a=s):a=s;var h=this._makeAbs(a);if(At(this,a))return i();c[0]===D.GLOBSTAR?this._processGlobStar(s,a,h,c,e,r,i):this._processReaddir(s,a,h,c,e,r,i)}},It.prototype._processReaddir=function(t,e,r,n,i,s,o){var a=this;this._readdir(r,s,function(c,h){return a._processReaddir2(t,e,r,n,i,s,h,o)})},It.prototype._processReaddir2=function(t,e,r,n,s,o,a,c){if(!a)return c();for(var h=n[0],u=!!this.minimatch.negate,l=this.dot||"."===h._glob.charAt(0),f=[],p=0;p<a.length;p++)("."!==(g=a[p]).charAt(0)||l)&&(u&&!t?!g.match(h):g.match(h))&&f.push(g);var d=f.length;if(0===d)return c();if(1===n.length&&!this.mark&&!this.stat){for(this.matches[s]||(this.matches[s]=Object.create(null)),p=0;p<d;p++){var g=f[p];t&&(g="/"!==t?t+"/"+g:t+g),"/"!==g.charAt(0)||this.nomount||(g=i.join(this.root,g)),this._emitMatch(s,g)}return c()}for(n.shift(),p=0;p<d;p++)g=f[p],t&&(g="/"!==t?t+"/"+g:t+g),this._process([g].concat(n),s,o,c);c()},It.prototype._emitMatch=function(t,e){if(!this.aborted&&!St(this,e))if(this.paused)this._emitQueue.push([t,e]);else{var r=V(e)?e:this._makeAbs(e);if(this.mark&&(e=this._mark(e)),this.absolute&&(e=r),!this.matches[t][e]){if(this.nodir){var n=this.cache[r];if("DIR"===n||Array.isArray(n))return}this.matches[t][e]=!0;var i=this.statCache[r];i&&this.emit("stat",e,i),this.emit("match",e)}}},It.prototype._readdirInGlobStar=function(t,e){if(!this.aborted){if(this.follow)return this._readdir(t,!1,e);var n=this,i=Et("lstat\0"+t,function(r,i){if(r&&"ENOENT"===r.code)return e();var s=i&&i.isSymbolicLink();n.symlinks[t]=s,s||!i||i.isDirectory()?n._readdir(t,!1,e):(n.cache[t]="FILE",e())});i&&r.lstat(t,i)}},It.prototype._readdir=function(t,e,n){if(!this.aborted&&(n=Et("readdir\0"+t+"\0"+e,n))){if(e&&!kt(this.symlinks,t))return this._readdirInGlobStar(t,n);if(kt(this.cache,t)){var i=this.cache[t];if(!i||"FILE"===i)return n();if(Array.isArray(i))return n(null,i)}r.readdir(t,function(t,e,r){return function(n,i){n?t._readdirError(e,n,r):t._readdirEntries(e,i,r)}}(this,t,n))}},It.prototype._readdirEntries=function(t,e,r){if(!this.aborted){if(!this.mark&&!this.stat)for(var n=0;n<e.length;n++){var i=e[n];this.cache[i="/"===t?t+i:t+"/"+i]=!0}return this.cache[t]=e,r(null,e)}},It.prototype._readdirError=function(t,e,r){if(!this.aborted){switch(e.code){case"ENOTSUP":case"ENOTDIR":var n=this._makeAbs(t);if(this.cache[n]="FILE",n===this.cwdAbs){var i=new Error(e.code+" invalid cwd "+this.cwd);i.path=this.cwd,i.code=e.code,this.emit("error",i),this.abort()}break;case"ENOENT":case"ELOOP":case"ENAMETOOLONG":case"UNKNOWN":this.cache[this._makeAbs(t)]=!1;break;default:this.cache[this._makeAbs(t)]=!1,this.strict&&(this.emit("error",e),this.abort()),this.silent||console.error("glob error",e)}return r()}},It.prototype._processGlobStar=function(t,e,r,n,i,s,o){var a=this;this._readdir(r,s,function(c,h){a._processGlobStar2(t,e,r,n,i,s,h,o)})},It.prototype._processGlobStar2=function(t,e,r,n,i,s,o,a){if(!o)return a();var c=n.slice(1),h=t?[t]:[],u=h.concat(c);this._process(u,i,!1,a);var l=o.length;if(this.symlinks[r]&&s)return a();for(var f=0;f<l;f++)if("."!==o[f].charAt(0)||this.dot){var p=h.concat(o[f],c);this._process(p,i,!0,a);var d=h.concat(o[f],n);this._process(d,i,!0,a)}a()},It.prototype._processSimple=function(t,e,r){var n=this;this._stat(t,function(i,s){n._processSimple2(t,e,i,s,r)})},It.prototype._processSimple2=function(t,e,r,n,s){if(this.matches[e]||(this.matches[e]=Object.create(null)),!n)return s();if(t&&V(t)&&!this.nomount){var o=/[\/\\]$/.test(t);"/"===t.charAt(0)?t=i.join(this.root,t):(t=i.resolve(this.root,t),o&&(t+="/"))}"win32"===process.platform&&(t=t.replace(/\\/g,"/")),this._emitMatch(e,t),s()},It.prototype._stat=function(t,e){var n=this._makeAbs(t),i="/"===t.slice(-1);if(t.length>this.maxLength)return e();if(!this.stat&&kt(this.cache,n)){var s=this.cache[n];if(Array.isArray(s)&&(s="DIR"),!i||"DIR"===s)return e(null,s);if(i&&"FILE"===s)return e()}var o=this.statCache[n];if(void 0!==o){if(!1===o)return e(null,o);var a=o.isDirectory()?"DIR":"FILE";return i&&"FILE"===a?e():e(null,a,o)}var c=this,h=Et("stat\0"+n,function(i,s){if(s&&s.isSymbolicLink())return r.stat(n,function(r,i){r?c._stat2(t,n,null,s,e):c._stat2(t,n,r,i,e)});c._stat2(t,n,i,s,e)});h&&r.lstat(n,h)},It.prototype._stat2=function(t,e,r,n,i){if(r&&("ENOENT"===r.code||"ENOTDIR"===r.code))return this.statCache[e]=!1,i();var s="/"===t.slice(-1);if(this.statCache[e]=n,"/"===e.slice(-1)&&n&&!n.isDirectory())return i(null,!1,n);var o=!0;return n&&(o=n.isDirectory()?"DIR":"FILE"),this.cache[e]=this.cache[e]||o,s&&"FILE"===o?i():i(null,o,n)},module.exports=jt;
//# sourceMappingURL=glob.js.map