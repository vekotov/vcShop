function renderPage(good) {
  console.log(good)

  document.getElementById("aboutGoodImage").src = good.image
  document.getElementById("goodprice").innerText = (+good.price).toFixed(2) + " руб."
  document.getElementById("itemName").innerText = good.name
  document.getElementById("description").innerHTML = good.description.trim().split('\n').map(e => e.trim()).join("<br>")
}

function xml2json(xml) {
  try {
    var obj = {};
    if (xml.children.length > 0) {
      for (var i = 0; i < xml.children.length; i++) {
        var item = xml.children.item(i);
        var nodeName = item.nodeName;

        if (typeof (obj[nodeName]) == "undefined") {
          obj[nodeName] = xml2json(item);
        } else {
          if (typeof (obj[nodeName].push) == "undefined") {
            var old = obj[nodeName];

            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xml2json(item));
        }
      }
    } else {
      obj = xml.textContent;
    }
    return obj;
  } catch (e) {
    console.log(e.message);
  }
}

var goods = {}
var cart = {}
var xhr = new XMLHttpRequest();
xhr.onload = function() {
  let data = xml2json(xhr.response)
  if (!Array.isArray(data.goods.good)) {
    data.goods.good = new Array(data.goods.good)
  }
  data.goods.good.forEach(element => {
    element["counter"] = 1
    goods[element.id] = element
  })

  let params = {}
  window.location.search.substr(1).split('&').forEach(e => {
    let data = e.split('=')
    params[data[0]] = data[1]
  })

  if (!params["id"]) {
    window.location = "/index.html"
  }

  renderPage(goods[+params["id"]]) // get smthng
  let cookieCart = getCookie("cart")

  if (cookieCart) cart = cookieCart
  rerenderCart()
}

xhr.open("GET", "/data.xml");
xhr.responseType = "document";
xhr.send();

function setCookie(name, value) {
  let text = encodeURIComponent(JSON.stringify(value))
  document.cookie = encodeURIComponent(name) + '=' + text;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  try {
    if (parts.length === 2) return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
  } catch(e) {
    // no valid cookie
  }
}

function rerenderCart() {
  let sum = 0

  for (const [key, element] of Object.entries(cart)) {
    sum += +goods[key].price * element
  }

  document.getElementById("cartText").innerText = "Корзина: " + sum.toFixed(2) + " руб."
}

function addToCart(id) {
  if (!cart[id]) cart[id] = 0;
  cart[id] += goods[id].counter

  setCookie("cart", cart)
  rerenderCart()
}

function increaseCounter(id) {
  let obj = goods[id]

  obj.counter++;

  document.getElementById("goodcounter").innerText = obj.counter + " шт."
  document.getElementById("goodprice").innerText = (obj.price.replace(',', '.') * obj.counter).toFixed(2).replace(',', '.') + " руб."
}

function decreaseCounter(id) {
  let obj = goods[id]

  obj.counter--;

  if (obj.counter <= 0) obj.counter = 1;

  document.getElementById("goodcounter").innerText = obj.counter + " шт."
  document.getElementById("goodprice").innerText = (obj.price.replace(',', '.') * obj.counter).toFixed(2).replace(',', '.') + " руб."
}