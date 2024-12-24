from routes import app, db
from models import Product

with app.app_context():
    db.create_all()
    if not Product.query.first():
        products = [
            Product(name="Route-Mi Tshirt", price=10),
            Product(name="Route-Mi Sweatshirt", price=10),
            Product(name="Route-Mi Hat", price=10),
            Product(name="Route-Mi Pant", price=10),
            Product(name="Route-Mi Hoodie", price=10),
            Product(name="Flag", price=50)
        ]
        db.session.bulk_save_objects(products)
        db.session.commit()

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
