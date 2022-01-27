function renderGoods(goods) {
  let cat = document.getElementById("catalog")
  let text = "";

  for (const [key, element] of Object.entries(goods)) {
    text += `<div class="goods" id="good` + element.id + `">
    <a href="./about.html?id=` + element.id + `" class="goodsLink">
      <img class="goodsImg" src="` + element.image + `">
      <div class="goodsName">
        ` + element.name + `
      </div>
      <div class="price" id="good` + element.id + `price">
        ` + element.price + ` руб.
      </div>
    </a>
    <div class="countSwitcher">
      <div class="minus" onclick="decreaseCounter(` + element.id + `)">
        -
      </div>
      <div class="count" id="good` + element.id + `counter">
        1 шт.
      </div>
      <div class="plus" onclick="increaseCounter(` + element.id + `)">
        +
      </div>
    </div>
    <div class="buyButton" onclick="addToCart(` + element.id + `)">
      Купить
    </div>
  </div>`
  }

  cat.innerHTML = text
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
  renderGoods(goods)
  let cookieCart = getCookie("cart")

  if (cookieCart) cart = cookieCart
  rerenderCart()
}

var counters = {}

xhr.open("GET", "./data.xml");
xhr.responseType = "document";
xhr.send();

function increaseCounter(id) {
  let obj = goods[id]

  obj.counter++;

  document.getElementById("good" + id + "counter").innerText = obj.counter + " шт."
  document.getElementById("good" + id + "price").innerText = (obj.price.replace(',', '.') * obj.counter).toFixed(2).replace(',', '.') + " руб."
}

function decreaseCounter(id) {
  let obj = goods[id]

  obj.counter--;

  if (obj.counter <= 0) obj.counter = 1;

  document.getElementById("good" + id + "counter").innerText = obj.counter + " шт."
  document.getElementById("good" + id + "price").innerText = (obj.price.replace(',', '.') * obj.counter).toFixed(2).replace(',', '.') + " руб."
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

function setCookie(name, value) {
  let text = encodeURIComponent(JSON.stringify(value))
  document.cookie = encodeURIComponent(name) + '=' + text;
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

function emptyCart() {
  cart = {}
  rerenderCart()
  setCookie("cart", cart)
}