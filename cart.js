// app.js
const express = require('express');
const session = require('express-session');

const app = express();

// Configurar middleware para manejar datos de formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar la sesión
app.use(session({
  secret: 'secreto-del-carrito',
  resave: false,
  saveUninitialized: true
}));

// Lista de productos simulada
const productos = [
  { id: 1, nombre: 'Producto A', precio: 10 },
  { id: 2, nombre: 'Producto B', precio: 20 },
  { id: 3, nombre: 'Producto C', precio: 30 },
];

// Middleware para inicializar el carrito en la sesión
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
});

// Ruta de inicio
app.get('/', (req, res) => {
  res.send('<h1>Bienvenido a la tienda</h1><a href="/productos">Ver productos</a>');
});

// Mostrar la lista de productos
app.get('/productos', (req, res) => {
  let contenido = '<h1>Productos disponibles</h1><ul>';
  productos.forEach(producto => {
    contenido += `<li>${producto.nombre} - $${producto.precio} 
    <a href="/agregar/${producto.id}">Agregar al carrito</a></li>`;
  });
  contenido += '</ul><a href="/carrito">Ver carrito</a>';
  res.send(contenido);
});

// Agregar producto al carrito
app.get('/agregar/:id', (req, res) => {
  const idProducto = parseInt(req.params.id);
  const producto = productos.find(p => p.id === idProducto);
  if (producto) {
    req.session.cart.push(producto);
    res.send(`${producto.nombre} ha sido agregado al carrito.<br><a href="/productos">Seguir comprando</a> | <a href="/carrito">Ver carrito</a>`);
  } else {
    res.send('Producto no encontrado.');
  }
});

// Ver el carrito
app.get('/carrito', (req, res) => {
  const carrito = req.session.cart;
  if (carrito.length === 0) {
    res.send('El carrito está vacío.<br><a href="/productos">Agregar productos</a>');
  } else {
    let contenido = '<h1>Carrito de compras</h1><ul>';
    let total = 0;
    carrito.forEach((producto, index) => {
      contenido += `<li>${producto.nombre} - $${producto.precio} 
      <a href="/eliminar/${index}">Eliminar</a></li>`;
      total += producto.precio;
    });
    contenido += `</ul><p>Total: $${total}</p><a href="/productos">Seguir comprando</a> | <a href="/vaciar">Vaciar carrito</a>`;
    res.send(contenido);
  }
});

// Eliminar producto del carrito
app.get('/eliminar/:index', (req, res) => {
  const indice = parseInt(req.params.index);
  if (indice >= 0 && indice < req.session.cart.length) {
    const productoEliminado = req.session.cart.splice(indice, 1);
    res.send(`${productoEliminado[0].nombre} ha sido eliminado del carrito.<br><a href="/carrito">Volver al carrito</a>`);
  } else {
    res.send('Producto no encontrado en el carrito.');
  }
});

// Vaciar el carrito
app.get('/vaciar', (req, res) => {
  req.session.cart = [];
  res.send('El carrito ha sido vaciado.<br><a href="/productos">Agregar productos</a>');
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});