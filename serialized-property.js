/**
 serialized-property - serialize and deserialize property
 @version v0.0.1
 @link https://github.com/7korobi/serialized-property
 @license 
**/

(function() {
  var Serial, array_base_parser, c, func, i, key, len, n, pack, patch_size, ref, serial, string_parser, string_serializer, unpack;

  serial = {
    to_s: "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
    to_i: {}
  };

  ref = serial.to_s;
  for (n = i = 0, len = ref.length; i < len; n = ++i) {
    c = ref[n];
    serial.to_i[c] = n;
  }

  serial.size = serial.to_s.length;

  patch_size = serial.size * serial.size * serial.size;

  string_parser = function(val) {
    switch (val) {
      case "":
      case null:
      case void 0:
        return "";
      default:
        return String(val);
    }
  };

  string_serializer = function(val) {
    switch (val) {
      case "":
      case null:
      case void 0:
        return "";
      default:
        return String(val).replace(/[~\/=.&\?\#\[\]()\"'`;]/g, function(s) {
          return "%" + s.charCodeAt(0).toString(16);
        });
    }
  };

  array_base_parser = function(val) {
    if (Array.isArray(val)) {
      return val;
    } else {
      return ("" + val).split(",");
    }
  };

  pack = {
    Keys: function(val) {
      var item, key, list;
      list = (function() {
        var results;
        if (Array.isArray(val)) {
          return val;
        } else {
          results = [];
          for (key in val) {
            item = val[key];
            if (!item) {
              continue;
            }
            results.push(key);
          }
          return results;
        }
      })();
      return pack.Array(list.sort());
    },
    Array: function(val) {
      if (Array.isArray(val)) {
        return val.join(",");
      } else {
        return "" + val;
      }
    },
    Date: function(val) {
      var result, time;
      time = Math.floor(val);
      result = "";
      while (time >= 1) {
        result += serial.to_s[time % serial.size];
        time = Math.floor(time / serial.size);
      }
      return result;
    },
    Bool: function(bool) {
      if (bool) {
        return "T";
      } else {
        return "F";
      }
    },
    Number: string_serializer,
    Text: string_serializer,
    String: string_serializer,
    "null": string_serializer,
    undefined: string_serializer,
    Thru: function(o) {
      return o;
    }
  };

  unpack = {
    HtmlGon: function(html) {
      var code, pattern, script;
      pattern = /<script.*?>([\s\S]*?)<\/script>/ig;
      while (script = pattern.exec(html)) {
        code = script[1];
        if (code.length > 0) {
          eval(code);
        }
      }
      return gon;
    },
    Keys: function(val) {
      var bool, hash, j, key, len1, list;
      hash = {};
      if (val.length) {
        list = array_base_parser(val);
        for (j = 0, len1 = list.length; j < len1; j++) {
          key = list[j];
          hash[key] = true;
        }
      } else {
        for (key in val) {
          bool = val[key];
          if (bool) {
            hash[key] = true;
          }
        }
      }
      return hash;
    },
    Array: function(val) {
      if (val.length) {
        return array_base_parser(val);
      } else {
        return [];
      }
    },
    Date: function(code) {
      var base, j, len1, result;
      if (0 < code) {
        return code;
      }
      base = 1;
      result = 0;
      for (j = 0, len1 = code.length; j < len1; j++) {
        c = code[j];
        n = serial.to_i[c];
        if (n == null) {
          return Number.NaN;
        }
        result += n * base;
        base *= serial.size;
      }
      return result;
    },
    Bool: function(val) {
      switch (val) {
        case true:
        case "T":
          return true;
        case false:
        case "F":
          return false;
        default:
          return Number.NaN;
      }
    },
    Number: Number,
    Text: string_parser,
    String: string_parser,
    "null": string_parser,
    undefined: string_parser,
    Thru: function(o) {
      return o;
    }
  };

  Serial = {
    url: {},
    ID: {
      now: function() {
        return Serial.ID.at(_.now());
      },
      at: function(date, count) {
        if (count == null) {
          count = Math.random() * patch_size;
        }
        return pack.Date(date * patch_size + count);
      }
    }
  };

  for (key in unpack) {
    func = unpack[key];
    Serial.url[key] = (function() {
      switch (key) {
        case "Number":
          return "([-]?[\\.0-9]+)";
        case "Date":
          return "([0-9a-zA-Z]+)";
        case "Array":
        case "Keys":
          return "([^\\~\\/\\=\\.\\&\\[\\]\\(\\)\\\"\\'\\`\\;]*)";
        case "Text":
          return "([^\\~\\/\\=\\.\\&\\[\\]\\(\\)\\\"\\'\\`\\;]*)";
        default:
          return "([^\\~\\/\\=\\.\\&\\[\\]\\(\\)\\\"\\'\\`\\;]+)";
      }
    })();
  }

  this.pack = pack;

  this.unpack = unpack;

  this.Serial = Serial;

}).call(this);
