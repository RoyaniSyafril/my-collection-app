// Langkah 1: Inisialisasi Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";
import { doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
// Import SweetAlert2 via CDN
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.js';

// Inisialisasi Storage
const storage = getStorage(app);

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
const itemsCol = collection(db, "items"); // Koleksi bernama 'items' di Firestore

// Variabel Global
let allData = [];
const container = document.getElementById('collection-container');
const searchInput = document.getElementById('search-input');
const counter = document.getElementById('counter');
const addForm = document.getElementById('add-form');

// Langkah 2: Menampilkan Data secara Real-time (Read) 
onSnapshot(itemsCol, (snapshot) => {
    // Mengambil data dari Firestore dan menyimpannya ke array allData
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
            // Di dalam loop renderData:
<button onclick="hapusKoleksi('${item.id}')" class="btn-hapus">Hapus</button>
        </div>
    `).join('');
    counter.innerText = `Menampilkan ${items.length} barang`;
}

// Langkah 3: Menambah Data (Create)
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('gambar_url').files[0];
    
    if (!file) return Swal.fire('Peringatan', 'Mohon pilih foto koleksi!', 'warning');

    Swal.fire({ title: 'Sedang mengunggah...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

    try {
        // 1. Upload ke Storage
        const storageRef = ref(storage, 'koleksi/' + file.name);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // 2. Simpan URL ke Firestore
        await addDoc(itemsCol, {
            nama_barang: document.getElementById('nama-barang').value,
            kategori: document.getElementById('kategori-barang').value,
            kondisi: document.getElementById('kondisi-barang').value,
            harga_estimasi: Number(document.getElementById('harga-barang').value),
            gambar_url: downloadURL, // URL asli dari Cloud Storage
            createdAt: new Date()
        });

        Swal.fire('Berhasil!', 'Koleksi baru telah ditambahkan.', 'success');
        addForm.reset();
    } catch (error) {
        Swal.fire('Error', 'Proses gagal: ' + error.message, 'error');
    }
});

// Integrasi Fitur Lama: Search (Tugas 2) 
searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allData.filter(item => 
        item.nama_barang.toLowerCase().includes(val) ||
        item.kategori.toLowerCase().includes(val) ||
        item.kondisi.toLowerCase().includes(val)
    );
    renderData(filtered);
});

// Fungsi Hapus dengan SweetAlert2 (Tugas 4)
window.hapusKoleksi = async (id) => {
    const result = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: "Data yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
        try {
            const docRef = doc(db, "items", id);
            await deleteDoc(docRef);
            Swal.fire('Terhapus!', 'Koleksi berhasil dibuang.', 'success');
        } catch (error) {
            Swal.fire('Error', 'Gagal menghapus data', 'error');
        }
    }
};
