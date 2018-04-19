from firebase import firebase

# connect to default firebase application page
fb = firebase.FirebaseApplication('https://blossom-9a5cc.firebaseio.com/', None)

def fb_put(a, b, c):
    """
    Put value into database
    args:
        a   first level key
        b   second level key
        c   value
    """
    return fb.put(a, b, c)

def fb_get(a, b=None):
    """
    Get value from database
    args:
        a   first level key
        b   second level key
    """
    return fb.get(a, b)