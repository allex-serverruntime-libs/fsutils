function createUtil(lib){
  'use strict';
  var Node = require('allex_nodehelpersserverruntimelib')(lib),
    fs = Node.Fs,
    Path = Node.Path,
    q = lib.q;

  function surePath(path) {
    if (lib.isArray(path)) {
      return Path.join.apply(Path, path);
    }
    return path;
  }

  function satisfyPath(path){
    var p;
    path = surePath(path);
    p = Path.isAbsolute(path) ? path : Path.join(process.cwd(),path);
    fs.ensureDirSync(path);
  }
  function pathForFilename(path,filename){
    var ret = Path.join(surePath(path),filename);
    satisfyPath(Path.dirname(ret));
    return ret;
  }
  function typeFromStats(stats){
    if(stats.isFile()){
      return 'f';
    }
    if(stats.isDirectory()){
      return 'd';
    }
    if(stats.isBlockDevice()){
      return 'b';
    }
    if(stats.isCharacterDevice()){
      return 'c';
    }
    if(stats.isSymbolicLink()){
      return 'l';
    }
    if(stats.isSocket()){
      return 's';
    }
    if(stats.isFIFO()){
      return 'n'; //named pipe
    }
  }
  function fileType(filepath,defer){
    if(defer){
      fs.lstat(surePath(filepath),function(err,fstats){
        if(err){
          defer.resolve(0);
        }else{
          defer.resolve(typeFromStats(fstats));
        }
      });
    }else{
      try{
        var fstats = fs.lstatSync(surePath(filepath));
        return typeFromStats(fstats);
      }
      catch(e){
        return '';
      }
    }
  }
  function fileTypePromised(filepath) {
    var d = q.defer(), ret = d.promise;
    fileType(filepath,d);
    return ret;
  }
  function fileSize(filepath,defer){
    if(defer){
      fs.lstat(surePath(filepath),function(err,fstats){
        if(err){
          defer.resolve(0);
        }else{
          defer.resolve(fstats.size);
        }
        defer = null;
      });
    }else{
      try{
        var fstats = fs.lstatSync(surePath(filepath));
        return fstats.size;
      }
      catch(e){
        return 0;
      }
    }
  }

  function fileSizePromised(filepath) {
    var d = q.defer(), ret = d.promise;
    fileSize(filepath, d);
    return ret;
  }

  function FStats(filepath,defer) {
    if(defer){
      fs.lstat(surePath(filepath),function(err,fstats){
        if(err){
          defer.resolve(null);
        }else{
          defer.resolve(fstats);
        }
        defer = null;
      });
    }else{
      try{
        var fstats = fs.lstatSync(surePath(filepath));
        return fstats;
      }
      catch(e){
        return null;
      }
    }
  }

  function FStatsPromised(filepath) {
    var d = q.defer(), ret = d.promise;
    FStats(filepath, d);
    return ret;
  }

  var _dotCharCode = ".".charCodeAt(0);

  function changeExtension (filename, ext) {
    var dotindex = -1, fnl = filename.length, i;
    for (i=fnl-1; i>0 && dotindex<0; i--) {
      if (filename.charCodeAt(i) === _dotCharCode) {
        dotindex = i;
      }
    }
    if (dotindex>=0) {
      return filename.substring(0, dotindex)+ext;
    }
    return filename+ext;
  }

  return {
    surePath: surePath,
    satisfyPath: satisfyPath,
    pathForFilename: pathForFilename,
    fileSize: fileSize,
    fileSizePromised: fileSizePromised,
    fileType: fileType,
    fileTypePromised: fileTypePromised,
    FStats: FStats,
    FStatsPromised: FStatsPromised,
    typeFromStats: typeFromStats,
    changeExtension: changeExtension
  };
}

module.exports = createUtil;

