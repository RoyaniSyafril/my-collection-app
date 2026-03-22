import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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
const itemsCol = collection(db, "items");

let allData = [];
const container = document.getElementById('collection-container');
const searchInput = document.getElementById('search-input');
const counter = document.getElementById('counter');
const addForm = document.getElementById('add-form');

// --- FUNGSI PEMBANTU: Konversi Gambar ke Base64 ---
const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = (error) => reject(error);
    });
};

// 1. READ: Menampilkan Data Real-time
onSnapshot(itemsCol, (snapshot) => {
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
                <button onclick="hapusKoleksi('${item.id}')" class="btn-hapus">Hapus</button>
            </div>
        </div>
    `).join('');
    counter.innerText = `Menampilkan ${items.length} barang`;
}

// 2. CREATE: Tambah Data dengan Base64 Upload
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('foto-barang');
    const file = fileInput.files[0];

    // Validasi Ukuran File (Penting untuk Base64 agar Firestore tidak berat)
    if (file && file.size > 1048487) { // 1MB Limit
        return Swal.fire('File Terlalu Besar', 'Gunakan foto di bawah 1MB agar performa stabil.', 'warning');
    }

    Swal.fire({
        title: 'Menyimpan ke Cloud...',
        text: 'Sedang memproses penyimpanan',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        let finalImageUrl = "https://via.placeholder.com/150";
        
        if (file) {
            finalImageUrl = await convertBase64(file);
        }

        const newData = {
            nama_barang: document.getElementById('nama-barang').value,
            kategori: document.getElementById('kategori-barang').value,
            kondisi: document.getElementById('kondisi-barang').value,
            harga_estimasi: Number(document.getElementById('harga-barang').value),
            gambar_url: finalImageUrl, 
            createdAt: new Date()
        };

        await addDoc(itemsCol, newData); 
        
        addForm.reset();
        Swal.fire('Berhasil!', 'Data dan foto berhasil disimpan di Firestore.', 'success');
    } catch (error) {
        Swal.fire('Gagal!', error.message, 'error');
    }
});

// 3. DELETE: Hapus Data
window.hapusKoleksi = async (id) => {
    const result = await Swal.fire({
        title: 'Hapus koleksi ini?',
        text: "Data akan hilang permanen dari database!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
        try {
            await deleteDoc(doc(db, "items", id));
            Swal.fire('Terhapus!', 'Data berhasil dibuang.', 'success');
        } catch (error) {
            Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error');
        }
    }
};

// 4. SEARCH
searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allData.filter(item => 
        item.nama_barang.toLowerCase().includes(val) ||
        item.kategori.toLowerCase().includes(val) ||
        item.kondisi.toLowerCase().includes(val)
    );
    renderData(filtered);
});