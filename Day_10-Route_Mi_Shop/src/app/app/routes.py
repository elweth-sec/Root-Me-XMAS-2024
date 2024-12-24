from flask import Flask, render_template, redirect, url_for, flash, session, request
from models import db, User, Product, Coupon
from uuid import uuid4
from functools import wraps
from time import sleep

app = Flask(__name__)
app.config.from_object('config.Config')
db.init_app(app)

def anti_bruteforce(time):
    return sleep(time)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def home():
    products = Product.query.all()
    return render_template('home.html', products=products)

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(email=email).first():
            flash('Email already known.')
            return redirect(url_for('signup'))
        
        new_user = User(email=email)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        coupon_code = str(uuid4())
        coupon = Coupon(code=coupon_code, user_id=new_user.id)
        
        db.session.add(coupon)
        db.session.commit()
        
        flash('Account created! You can now login.')
        return redirect(url_for('login'))
    
    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            session['user_id'] = user.id
            return redirect(url_for('home'))
        flash('User or password incorrect.')
    return render_template('login.html')

@app.route('/account')
@login_required
def account():
    user = User.query.get(session['user_id'])
    coupon = Coupon.query.filter_by(user_id=user.id).first()
    return render_template('account.html', user=user, coupon=coupon)

@app.route('/discount', methods=['POST'])
@login_required
def discount():
    user = User.query.get(session['user_id'])
    coupon_code = request.form.get('coupon_code')

    coupon = Coupon.query.filter_by(user_id=user.id, code=coupon_code).first()

    balance = int(user.balance)
    if coupon:
        if not coupon.used:
            balance += 5.0
            user.balance = balance
            db.session.commit()

            anti_bruteforce(2)

            coupon.used = True
            user.can_use_coupon = False
            db.session.commit()
            flash("Your account has been credited with 5€ !")
        else:
            flash("This coupon has already been used.")
    else:
        flash("This coupon is invalid or does not belong to you.")

    return redirect(url_for('account'))

@app.route('/buy/<int:product_id>', methods=['POST'])
@login_required
def buy(product_id):
    product = Product.query.get(product_id)
    user = User.query.get(session['user_id'])

    if user.balance >= product.price:
        if product.name == "Flag":
            flash(f"Congratzzz, here is your flag : {open('flag.txt').read()}")
        else:
            flash(f"Thanks for your purchase! You will receive your ✨{product.name}✨ very soon!")

        user.balance -= product.price
        db.session.commit()
    else:
        flash("Insufficient balance for this product.")

    return redirect(url_for('home'))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('home'))
