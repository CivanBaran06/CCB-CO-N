// -------------------------
// GLOBAL DEĞİŞKENLER
// -------------------------
let coinsData = [];      // Coin API verileri
let balance = 0;         // Kullanıcı bakiyesi
let myCoins = [];        // Kullanıcının sahip olduğu coinler
let currentUser = null;  // Giriş yapmış kullanıcı (null = giriş yok)

// Örnek kullanıcı (otomatik login için)
const savedUser = {
  username: "testuser",
  password: "12345",
  balance: 1000
};

// -------------------------
// DOM ELEMENTLERİ
// -------------------------
const coinList = document.getElementById("coinList");
const myCoinsList = document.getElementById("myCoinsList");
const balanceEl = document.getElementById("balance");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Ekranlar
const homeScreen = document.getElementById("homeScreen");
const buyScreen = document.getElementById("buyScreen");
const myCoinsScreen = document.getElementById("myCoinsScreen");
const settingsScreen = document.getElementById("settingsScreen");
const accountScreen = document.getElementById("accountScreen");

// Satın alma ekranı elemanları
const buyCoinImage = document.getElementById("buyCoinImage");
const buyCoinName = document.getElementById("buyCoinName");
const buyCoinPrice = document.getElementById("buyCoinPrice");
const buyAmount = document.getElementById("buyAmount");
const totalPriceEl = document.getElementById("totalPrice");
const confirmBuyBtn = document.getElementById("confirmBuyBtn");
const backBtn = document.getElementById("backBtn");

// Menü butonları
const addBalanceBtn = document.getElementById("addBalanceBtn");
const myCoinsBtn = document.getElementById("myCoinsBtn");
const settingsBtn = document.getElementById("settingsBtn");
const accountBtn = document.getElementById("accountBtn");

// Ayarlar ekranı
const themeSwitch = document.getElementById("themeSwitch");
const notifSwitch = document.getElementById("notifSwitch");
const backHomeFromSettings = document.getElementById("backHomeFromSettings");

// Hesap ekranı
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const userInfo = document.getElementById("userInfo");
const currentUserEl = document.getElementById("currentUser");
const logoutBtn = document.getElementById("logoutBtn");
const backHomeFromAccount = document.getElementById("backHomeFromAccount");

// Kayıt formu ve mesaj
const registerForm = document.getElementById("registerForm");
const registerSubmit = document.getElementById("registerSubmit");
const cancelRegister = document.getElementById("cancelRegister");
const registerMessage = document.getElementById("registerMessage");

// -------------------------
// 1️⃣ API'DEN COİN VERİLERİNİ ÇEKME
// -------------------------
const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

fetch(apiUrl)
  .then(res => res.json())
  .then(data => {
    coinsData = data;
    displayCoins(coinsData);
  })
  .catch(err => console.error("Coin verisi alınamadı:", err));

// -------------------------
// 2️⃣ ANA COİN LİSTESİ
// -------------------------
function displayCoins(coins) {
  if(!coinList) return;
  coinList.innerHTML = "";

  coins.forEach(coin => {
    const col = document.createElement("div");
    col.className = "col-md-6";
    col.innerHTML = `
      <div class="card shadow-sm p-3 text-center coin-card" data-id="${coin.id}">
        <img src="${coin.image}" alt="${coin.name}" class="coin-logo mx-auto mb-2">
        <h5 class="text-primary">${coin.name} (${coin.symbol.toUpperCase()})</h5>
        <p class="mb-1">💲 Fiyat: $${coin.current_price.toLocaleString()}</p>
        <p class="mb-1 ${coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}">
          📈 24s Değişim: ${coin.price_change_percentage_24h.toFixed(2)}%
        </p>
      </div>
    `;
    coinList.appendChild(col);
  });

  document.querySelectorAll(".coin-card").forEach(card => {
    card.addEventListener("click", () => {
      const coinId = card.getAttribute("data-id");
      const selectedCoin = coinsData.find(c => c.id === coinId);
      showBuyScreen(selectedCoin);
    });
  });
}

// -------------------------
// 3️⃣ SATIN ALMA EKRANI
// -------------------------
function showBuyScreen(coin) {
  homeScreen.classList.add("d-none");
  myCoinsScreen.classList.add("d-none");
  buyScreen.classList.remove("d-none");

  buyCoinImage.src = coin.image;
  buyCoinName.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
  buyCoinPrice.textContent = `Fiyat: $${coin.current_price}`;

  buyAmount.value = "";
  totalPriceEl.textContent = "";

  buyAmount.addEventListener("input", () => {
    const amount = parseFloat(buyAmount.value);
    if (!isNaN(amount) && amount > 0) {
      totalPriceEl.textContent = `Toplam: $${(amount * coin.current_price).toFixed(2)}`;
    } else {
      totalPriceEl.textContent = "";
    }
  });

  confirmBuyBtn.onclick = () => {
    const amount = parseFloat(buyAmount.value);
    if (isNaN(amount) || amount <= 0) {
      alert("Geçerli bir adet girin!");
      return;
    }

    const total = amount * coin.current_price;
    if (balance < total) {
      alert("Yeterli bakiyeniz yok!");
      return;
    }

    balance -= total;
    balanceEl.textContent = balance.toFixed(2);

    const existing = myCoins.find(c => c.id === coin.id);
    if (existing) {
      existing.amount += amount;
    } else {
      myCoins.push({ ...coin, amount });
    }

    alert(`${amount} adet ${coin.name} satın alındı!`);
    buyScreen.classList.add("d-none");
    homeScreen.classList.remove("d-none");
    buyAmount.value = "";
    totalPriceEl.textContent = "";
  };

  backBtn.onclick = () => {
    buyScreen.classList.add("d-none");
    homeScreen.classList.remove("d-none");
  };
}

// -------------------------
// 4️⃣ ARAMA
// -------------------------
searchBtn.addEventListener("click", () => {
  const searchValue = searchInput.value.toLowerCase();
  const filteredCoins = coinsData.filter(coin =>
    coin.name.toLowerCase().includes(searchValue) ||
    coin.symbol.toLowerCase().includes(searchValue)
  );
  displayCoins(filteredCoins);
});

// -------------------------
// 5️⃣ BAKİYE YÜKLEME
// -------------------------
addBalanceBtn.addEventListener("click", () => {
  const amount = parseFloat(prompt("Ne kadar bakiye eklemek istiyorsunuz?"));
  if (isNaN(amount) || amount <= 0) return;

  const cardNumber = prompt("Kart Numarası (Demo):");
  const cvv = prompt("CVV:");
  const expiry = prompt("Son Kullanma Tarihi (MM/YY):");

  if (!cardNumber || !cvv || !expiry) {
    alert("Kart bilgileri eksik! Bakiye eklenemedi.");
    return;
  }

  balance += amount;
  balanceEl.textContent = balance.toFixed(2);
  alert(`${amount} USD bakiyenize eklendi!`);
});

// -------------------------
// 6️⃣ KRİPTOLARIM
// -------------------------
myCoinsBtn.addEventListener("click", () => {
  homeScreen.classList.add("d-none");
  buyScreen.classList.add("d-none");
  accountScreen.classList.add("d-none");
  settingsScreen.classList.add("d-none");
  myCoinsScreen.classList.remove("d-none");

  renderMyCoins();
});

function renderMyCoins() {
  myCoinsList.innerHTML = "";

  if (myCoins.length === 0) {
    myCoinsList.innerHTML = `<p class="text-light">Henüz coin satın almadınız.</p>`;
    return;
  }

  myCoins.forEach(coin => {
    const col = document.createElement("div");
    col.className = "col-md-6";
    col.innerHTML = `
      <div class="card shadow-sm p-3 text-center">
        <img src="${coin.image}" alt="${coin.name}" class="coin-logo mx-auto mb-2">
        <h5 class="text-primary">${coin.name} (${coin.symbol.toUpperCase()})</h5>
        <p class="mb-1">Adet: ${coin.amount}</p>
        <p class="mb-0">Değer: $${(coin.amount * coin.current_price).toFixed(2)}</p>
      </div>
    `;
    myCoinsList.appendChild(col);
  });
}

document.getElementById("backHomeBtn").onclick = () => {
  myCoinsScreen.classList.add("d-none");
  homeScreen.classList.remove("d-none");
};

// -------------------------
// 7️⃣ AYARLAR
// -------------------------
settingsBtn.addEventListener("click", () => {
  homeScreen.classList.add("d-none");
  buyScreen.classList.add("d-none");
  accountScreen.classList.add("d-none");
  myCoinsScreen.classList.add("d-none");
  settingsScreen.classList.remove("d-none");
});

themeSwitch.addEventListener("change", () => {
  if (themeSwitch.checked) {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }
});

notifSwitch.addEventListener("change", () => {
  if (notifSwitch.checked) {
    alert("Bildirimler açıldı (demo)!");
  } else {
    alert("Bildirimler kapatıldı (demo)!");
  }
});

backHomeFromSettings.onclick = () => {
  settingsScreen.classList.add("d-none");
  homeScreen.classList.remove("d-none");
};

// -------------------------
// 8️⃣ HESAP / GİRİŞ / ÜYE OL
// -------------------------

accountBtn.addEventListener("click", () => {
  homeScreen.classList.add("d-none");
  buyScreen.classList.add("d-none");
  myCoinsScreen.classList.add("d-none");
  settingsScreen.classList.add("d-none");
  accountScreen.classList.remove("d-none");

  if (currentUser) {
    loginForm.classList.add("d-none");
    registerForm.classList.add("d-none");
    userInfo.classList.remove("d-none");
    currentUserEl.textContent = currentUser;
  } else {
    loginForm.classList.remove("d-none");
    registerForm.classList.add("d-none");
    userInfo.classList.add("d-none");
  }
});

// Login
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Önce örnek kullanıcı
  if (username === savedUser.username && password === savedUser.password) {
    currentUser = username;
    balance = savedUser.balance;
    alert(`${currentUser} başarıyla giriş yaptı!`);
    loginForm.classList.add("d-none");
    userInfo.classList.remove("d-none");
    currentUserEl.textContent = currentUser;
    balanceEl.textContent = balance.toFixed(2);
    return;
  }

  // LocalStorage kullanıcı
  const storedUser = localStorage.getItem(`user_${username}`);
  if (!storedUser) {
    alert("Kullanıcı bulunamadı! Önce üye olun.");
    return;
  }

  const userData = JSON.parse(storedUser);
  if (userData.password !== password) {
    alert("Şifre yanlış!");
    return;
  }

  currentUser = username;
  alert(`${currentUser} başarıyla giriş yaptı!`);
  loginForm.classList.add("d-none");
  userInfo.classList.remove("d-none");
  currentUserEl.textContent = currentUser;
});

// Üye Ol’a basınca kayıt formunu göster
registerBtn.addEventListener("click", () => {
  loginForm.classList.add("d-none");
  registerForm.classList.remove("d-none");
});

// Üye kaydı submit
registerSubmit.addEventListener("click", () => {
  const usernameVal = document.getElementById("regUsername").value.trim();
  const passwordVal = document.getElementById("regPassword").value.trim();
  const passwordVal2 = document.getElementById("regPassword2").value.trim();

  if (!usernameVal || !passwordVal || !passwordVal2) {
    alert("Tüm alanları doldurun!");
    return;
  }

  if (passwordVal !== passwordVal2) {
    alert("Şifreler uyuşmuyor!");
    return;
  }

  if (localStorage.getItem(`user_${usernameVal}`)) {
    alert("Bu kullanıcı adı zaten var!");
    return;
  }

  // Kullanıcıyı kaydet
  localStorage.setItem(`user_${usernameVal}`, JSON.stringify({
    username: usernameVal,
    password: passwordVal
  }));

  // Mesajı göster
  registerMessage.textContent = "Kayıt işleminiz tamamlanmıştır. Lütfen giriş yapınız.";
  registerMessage.style.display = "block";

  // Kayıt formunu gizle, login formunu göster
  registerForm.classList.add("d-none");
  loginForm.classList.remove("d-none");

  // 3 saniye sonra mesaj kaybolur
  setTimeout(() => {
    registerMessage.style.display = "none";
  }, 3000);
});

// Kayıt iptal
cancelRegister.addEventListener("click", () => {
  registerForm.classList.add("d-none");
  loginForm.classList.remove("d-none");
});

// Logout
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  loginForm.classList.remove("d-none");
  userInfo.classList.add("d-none");
  alert("Başarıyla çıkış yaptınız!");
});

backHomeFromAccount.onclick = () => {
  accountScreen.classList.add("d-none");
  homeScreen.classList.remove("d-none");
};
