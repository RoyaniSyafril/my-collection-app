// Langkah 1: Inisialisasi Firebase [cite: 30]
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDx_HALPC_FweyKTIKUp1XsvXclUbyyAIY",
  authDomain: "my-collection-app-7aac0.firebaseapp.com",
  projectId: "my-collection-app-7aac0",
  storageBucket: "my-collection-app-7aac0.firebasestorage.app",
  messagingSenderId: "323464497902",
  appId: "1:323464497902:web:2d4f9f108612e909ef41ff",
  measurementId: "G-L9GYK6YBT3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const itemsCol = collection(db, "items"); // Koleksi bernama 'items' di Firestore [cite: 18]

// Variabel Global
let allData = [];
const container = document.getElementById('collection-container');
const searchInput = document.getElementById('search-input');
const counter = document.getElementById('counter');
const addForm = document.getElementById('add-form');

// Langkah 2: Menampilkan Data secara Real-time (Read) [cite: 19, 42]
onSnapshot(itemsCol, (snapshot) => {
    // Mengambil data dari Firestore dan menyimpannya ke array allData [cite: 23]
    allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderData(allData);
});

function renderData(items) {
    container.innerHTML = items.map(item => `
        <div class="card">
            <img src="${item.gambar_url || 'https://via.placeholder.com/150'}" alt="${item.nama_barang}">
            <div class="card-info">
                <h3>${item.nama_barang}</h3>
                <p>Kategori: ${item.kategori}</p>
                <p>Kondisi: <strong>${item.kondisi}</strong></p>
                <p>Harga: Rp${Number(item.harga_estimasi).toLocaleString()}</p>
            </div>
        </div>
    `).join('');
    counter.innerText = `Menampilkan ${items.length} barang`;
}

// Langkah 3: Menambah Data (Create) [cite: 22, 43]
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newData = {
        nama_barang: document.getElementById('nama-barang').value,
        kategori: document.getElementById('kategori-barang').value,
        kondisi: document.getElementById('kondisi-barang').value,
        harga_estimasi: Number(document.getElementById('harga-barang').value),
        gambar_url: "https://via.placeholder.com/150", // Placeholder gambar
        createdAt: new Date()
    };

    try {
        await addDoc(itemsCol, newData); // Mengirim data ke Firestore [cite: 33, 43]
        addForm.reset();
        alert("Data koleksi berhasil disimpan ke Cloud!");
    } catch (error) {
        console.error("Gagal menyimpan data:", error);
    }
});

// Integrasi Fitur Lama: Search (Tugas 2) [cite: 24]
searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allData.filter(item => 
        item.nama_barang.toLowerCase().includes(val) ||
        item.kategori.toLowerCase().includes(val) ||
        item.kondisi.toLowerCase().includes(val)
    );
    renderData(filtered);
});
