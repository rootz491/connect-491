#FIREBASE 

##security rules
    >   .read       describes if and when data is allowed to be read by users.
    >   .write      describes if and when data is allowed to be written.
    >   .validate   defines what a correctly formatted value will look like, whether it has child attributes, and the data type.
    >   .indexOn    specifies a child index to support ordering and querying.

    *to validate write by autherisation*
    "user" {
        "$uid": {
            ".write": "$uid === auth.uid"
        }
    }

    *incoming data validation*
    "post": {
        ".validate": "newData.isString() && newData.val().length < 100"
    }

    *defining database indexes*
    "user": {
        "indexOn": ["userName", "age", "rank"]
    }

    *structuring security rules*
    "parent": {
        "child": {
            ".read": <condition>,
            ".write": <condition>,
            ".validate": <conditon>
        }
    }

    *wildcard capture variables*
    "posts": {
        "$pid": {
            "comments": {
                ".write": "$pid.contains('public')"
            }
        }
    }

    *Any write that would result in additional children being created would fail*
    "user": {
        "$uid": {
            "name": {".validate": <condition>},
            "age": {".validate": <condition>},
            "role": {".validate": <condition>},
            "$other": {".validate": false}
        }
    }

    >   a path is always string, so can't compare it with number.
        so bypass:
        $key === newData.val+()     will work just fine.

    *this is a delete or a create, but not an update*
    ".write": "!data.exists() || !newData.exists()"

    *reference data in other path*
    >   root, data, newData.

    *EXAMPLE*
    ".write": "root.child('allow_writes').val() === true &&
          !data.parent().child('readOnly').exists() &&
          newData.child('foo').exists()"

    *EXAMPLE RULES OVERVIEW*
    {
      "rules": {
        // write is allowed for all paths
        ".write": true,
        "widget": {
          // a valid widget must have attributes "color" and "size"
          // allows deleting widgets (since .validate is not applied to delete rules)
          ".validate": "newData.hasChildren(['color', 'size'])",
          "size": {
            // the value of "size" must be a number between 0 and 99
            ".validate": "newData.isNumber() &&
                          newData.val() >= 0 &&
                          newData.val() <= 99"
          },
          "color": {
            // the value of "color" must exist as a key in our mythical
            // /valid_colors/ index
            ".validate": "root.child('valid_colors/' + newData.val()).exists()"
          }
        }
      }
}