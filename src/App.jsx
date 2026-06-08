import React, { useState } from 'react';

// Real menu data parsed from images 1000071536.jpg and 1000071537 (1).jpg
const MENU_DATA = [
  // --- APPETIZERS ---
  { id: 1, name: "Arrancini", price: 16.99, category: "Appetizers", description: "Rich risotto made in house and stuffed with mozzarella, served with marinara and parmesan.", tags: ["V"] },
  { id: 2, name: "Garlic Parm Rolls", price: 12.99, category: "Appetizers", description: "Six fresh baked rolls smothered in butter, chopped garlic and parmesan. Served with marinara and pesto aioli.", tags: ["V"] },
  { id: 3, name: "Tronchetto Di Mozzarella", price: 19.99, category: "Appetizers", description: "Golden fried to perfection and served with marinara and pesto aioli.", tags: ["V"] },
  { id: 4, name: "Chicken Wings & Fries", price: 22.99, category: "Appetizers", description: "Fried golden and crispy, tossed in your choice of sauce, served with fresh cut fries.", tags: [] },
  { id: 5, name: "Spinach & Artichoke Dip", price: 12.99, category: "Appetizers", description: "A blend of three cheeses, spinach artichokes and seasonings, served hot with fried pita points.", tags: ["V"] },
  { id: 6, name: "Poutine Platter", price: 12.99, category: "Appetizers", description: "A large platter of fresh cut fries, rich brown gravy and classic Canadian cheese curds.", tags: ["V"] },

  // --- SALADS & SANDWICHES ---
  { id: 7, name: "Classic Caesar Salad", price: 20.99, category: "Salads & Sandwiches", description: "Crisp romaine tossed with our creamy garlic caesar dressing, savoury bacon, shredded parmesan cheese, herbed croutons and garnished with lemon.", tags: [] },
  { id: 8, name: "Italian Cobb Salad", price: 23.99, category: "Salads & Sandwiches", description: "Crisp romaine, sliced chicken, crispy prosciutto, boiled egg, roasted grape tomatoes, fresh cucumber and red onion. Choice of dressing.", tags: ["GF"] },
  { id: 9, name: "Pesto's House Salad", price: 19.99, category: "Salads & Sandwiches", description: "Spring lettuce, tri-coloured peppers, fresh cucumbers and grape tomatoes. Choice of dressing.", tags: ["V", "GF"] },
  { id: 10, name: "Chicken Parm Sandwich", price: 22.99, category: "Salads & Sandwiches", description: "A fried chicken cutlet, baked with marinara sauce and a blend of mozza and parmesan cheese. Placed on a soft brioche bun with side fries or salad.", tags: [] },
  { id: 11, name: "Classic Burger", price: 17.99, category: "Salads & Sandwiches", description: "6oz lean beef patty, grilled to perfection and served on a soft brioche bun with lettuce, tomato, onion and a pickle slice with fries or side salad.", tags: [] },
  { id: 12, name: "Porchetta Slider Trio", price: 18.99, category: "Salads & Sandwiches", description: "Our signature porchetta roast layered on soft slider rolls, with arugula, mozzarella and roasted garlic and pepper aioli. Served with fries or salad.", tags: [] },

  // --- ENTRÉES & PASTA ---
  { id: 13, name: "Chicken Marsala", price: 27.99, category: "Entrées & Pasta", description: "7oz chicken supreme, pan seared and simmered in our garlic, mushroom and marsala wine cream sauce. Served with herb roasted fingerling potatoes and seasonal vegetables.", tags: ["GF"] },
  { id: 14, name: "Signature Porchetta", price: 26.99, category: "Entrées & Pasta", description: "Sudbury's favourite dish, spiced in house with garlic and dill seasonings. Accompanied by herb roasted fingerling potatoes and seasonal vegetables.", tags: ["GF"] },
  { id: 15, name: "Beef 'Tagliata Di Manzo'", price: 39.99, category: "Entrées & Pasta", description: "8oz beef striploin, grilled and served over arugula with herbs and shaved parm, roasted fingerling potatoes and seasonal vegetables.", tags: ["GF"] },
  { id: 16, name: "Chicken Parmesan", price: 32.99, category: "Entrées & Pasta", description: "A fried chicken cutlet, baked with marinara sauce and our cheese blend. Served with spaghetti marinara.", tags: [] },
  { id: 17, name: "Paperdelle Primavera Con Aglio E Olio", price: 27.99, category: "Entrées & Pasta", description: "Fresh pasta ribbons, peppers, zucchini, spinach, grape tomatoes, garlic, olive oil and fresh basil. Served with a garlic roll.", tags: ["V"] },
  { id: 18, name: "Chicken and Sherri Cream Fettuccine", price: 28.99, category: "Entrées & Pasta", description: "Chicken breast, prosciutto, sherri cream liquor, fresh cream, baby spinach and fettuccine. Served with a garlic roll.", tags: [] },
  { id: 19, name: "Spaghetti and Meatballs", price: 23.99, category: "Entrées & Pasta", description: "Three of Nonna's giant meatballs over spaghetti and house made marinara. Served with a garlic roll.", tags: [] },

  // --- KIDS MENU ---
  { id: 20, name: "Kids Burger and Fries", price: 10.00, category: "Kids Menu", description: "3.25oz beef patty, brioche bun. (Includes small beverage & ice cream sundae)", tags: [] },
  { id: 21, name: "Chicken Nuggets and Fries", price: 10.00, category: "Kids Menu", description: "6 Crispy Chicken Nuggets with Plum Sauce. (Includes small beverage & ice cream sundae)", tags: [] },
  { id: 22, name: "Hot Dog and Fries", price: 10.00, category: "Kids Menu", description: "7inch All Beef Hot Dog. (Includes small beverage & ice cream sundae)", tags: [] },
  { id: 23, name: "Kids Spaghetti and Meatball", price: 10.00, category: "Kids Menu", description: "Spaghetti noodles tossed with tomato sauce and topped with one of Nonna's giant meatballs. (Includes small beverage & ice cream sundae)", tags: [] },
  { id: 24, name: "Kids Fettuccine Alfredo", price: 10.00, category: "Kids Menu", description: "Fettuccine noodles tossed with our creamy parmesan cheese, Alfredo sauce. (Includes small beverage & ice cream sundae)", tags: [] },

  // --- DESSERTS ---
  { id: 25, name: "Fresh Fried Beignets", price: 10.50, category: "Desserts", description: "Crispy on the outside, fluffy on the inside, tossed in icing sugar, Served with Strawberry Coulis", tags: [] },
  { id: 26, name: "Tri Di Cannoli", price: 10.50, category: "Desserts", description: "Mini Cannoli trio filled with Mascarpone cream, chocolate & pistachio's", tags: [] },
  { id: 27, name: "Turtle Cheesecake", price: 10.50, category: "Desserts", description: "Chocolate swirl cheesecake with chopped pecans, caramel & chocolate drizzle", tags: ["GF"] },
  { id: 28, name: "Tiramisu Cake", price: 12.00, category: "Desserts", description: "Espresso infused lady fingers topped with light and creamy mascarpone and dusted with cocoa", tags: [] }
];

const CATEGORIES = ["Appetizers", "Salads & Sandwiches", "Entrées & Pasta", "Kids Menu", "Desserts"];
const TAX_RATE = 0.13; // 13% HST

function App() {
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState("Appetizers");
  const [isCartOpen, setIsCartOpen] = useState(false); // Controls the summary view popover

  const addToCart = (id) => {
    setCart((prevCart) => ({ ...prevCart, [id]: (prevCart[id] || 0) + 1 }));
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      if (updatedCart[id] > 1) updatedCart[id] -= 1;
      else delete updatedCart[id];
      return updatedCart;
    });
  };

  const calculateSubtotal = () => {
    return MENU_DATA.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax;

  const filteredMenu = MENU_DATA.filter(item => item.category === activeCategory);
  
  // Get all items currently in the cart to map over inside the overlay panel
  const cartItems = MENU_DATA.filter(item => cart[item.id] > 0);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', color: '#333' }}>
      
      {/* Header */}
      <header style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '15px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, color: '#104c73', letterSpacing: '1px', fontSize: '28px', fontWeight: 'bold' }}>PESTO'S</h1>
        <p style={{ margin: '2px 0 8px 0', color: '#555', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px' }}>ITALIAN CUISINE & SALOON</p>
        <div style={{ display: 'inline-block', backgroundColor: '#eef4f8', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', color: '#104c73' }}>
          🛎️ Room 402
        </div>
      </header>

      {/* Horizontal Category Tabs */}
      <nav style={{ 
        display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '15px',
        WebkitOverflowScrolling: 'touch', borderBottom: '1px solid #eee'
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px', borderRadius: '20px',
              border: activeCategory === cat ? 'none' : '1px solid #cbd5e1',
              backgroundColor: activeCategory === cat ? '#104c73' : '#fff',
              color: activeCategory === cat ? '#fff' : '#475569',
              fontWeight: 'bold', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Main Menu List */}
      <main style={{ paddingBottom: '120px' }}>
        {filteredMenu.map((item) => {
          const itemQuantity = cart[item.id] || 0;
          return (
            <div 
              key={item.id} 
              style={{ 
                border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '12px',
                backgroundColor: itemQuantity > 0 ? '#f8fafc' : '#fff',
                borderColor: itemQuantity > 0 ? '#104c73' : '#e2e8f0',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.name}
                    {item.tags.map(tag => (
                      <span key={tag} style={{ 
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px', 
                        backgroundColor: tag === 'V' ? '#e2f0d9' : '#fce8e6', 
                        color: tag === 'V' ? '#385723' : '#c5221f', fontWeight: 'bold'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </h3>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4', paddingRight: '20px' }}>
                    {item.description}
                  </p>
                </div>
                <span style={{ fontWeight: 'bold', color: '#104c73', fontSize: '15px', whiteSpace: 'nowrap' }}>
                  ${item.price.toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                {itemQuantity > 0 && (
                  <>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 'bold', minWidth: '15px', textAlign: 'center', color: '#1e293b' }}>{itemQuantity}</span>
                  </>
                )}
                <button 
                  onClick={() => addToCart(item.id)}
                  style={{ 
                    padding: '6px 14px', borderRadius: '4px', border: 'none', 
                    backgroundColor: '#104c73', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px'
                  }}
                >
                  {itemQuantity > 0 ? '+' : 'Add'}
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {/* Background Dark Overlay for opened cart panel */}
      {isCartOpen && subtotal > 0 && (
        <div 
          onClick={() => setIsCartOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999 }}
        />
      )}

      {/* Interactive Bottom Bar & Sliding Cart Panel */}
      {subtotal > 0 && (
        <div style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          backgroundColor: '#fff', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', 
          maxWidth: '500px', margin: '0 auto', borderRadius: '16px 16px 0 0', border: '1px solid #e2e8f0',
          zIndex: 1000, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease'
        }}>
          
          {/* Header Bar Toggler */}
          <div 
            onClick={() => setIsCartOpen(!isCartOpen)}
            style={{ 
              padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: isCartOpen ? '1px solid #eee' : 'none', cursor: 'pointer', backgroundColor: '#f8fafc',
              borderRadius: '16px 16px 0 0'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                {isCartOpen ? '▼ HIDE DETAILS' : '▲ VIEW SELECTED ITEMS'}
              </span>
              <div style={{ fontSize: '14px', color: '#475569', marginTop: '2px' }}>
                {cartItems.reduce((acc, current) => acc + cart[current.id], 0)} items selected
              </div>
            </div>
            {!isCartOpen && (
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#104c73' }}>
                Total: ${grandTotal.toFixed(2)}
              </div>
            )}
          </div>

          {/* Expanded Selected Items Detail List */}
          {isCartOpen && (
            <div style={{ padding: '20px', maxHieght: '60vh', overflowY: 'auto' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1e293b', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                Review Order List
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, paddingRight: '10px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>${(item.price * cart[item.id]).toFixed(2)}</div>
                    </div>
                    
                    {/* Inline Modifiers/Editors */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ padding: '3px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', minWidth: '15px', textAlign: 'center', fontSize: '14px' }}>
                        {cart[item.id]}
                      </span>
                      <button 
                        onClick={() => addToCart(item.id)}
                        style={{ padding: '3px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#104c73', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Summary Section */}
              <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Tax (13% HST)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', color: '#104c73', marginTop: '4px' }}>
                  <span>Total Amount</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Final Submit Trigger */}
              <button 
                onClick={() => alert(`Submitting Final Bill ($${grandTotal.toFixed(2)}) to Kitchen Bridge Router...`)}
                style={{ 
                  backgroundColor: '#104c73', color: '#fff', border: 'none', width: '100%',
                  padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Send Order to Kitchen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;