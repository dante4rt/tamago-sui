# Workshop Tamagosui - Pengembangan Smart Contract Move Tingkat Lanjut

## 🚀 Modul 3: Advanced Smart Contract Development with Tamagosui

### 🎯 Tujuan Pembelajaran
Di akhir modul ini, Anda akan dapat:
- Mempelajari fitur-fitur lanjutan Sui dan Move melalui pembuatan game pet virtual ala Tamagotchi
- Memahami ownership, dynamic fields, dan logika berbasis waktu dalam praktik
- Membangun sistem pet virtual lengkap dengan metadata dan aksesori
- Menerapkan teknik optimasi gas untuk aplikasi gaming

## 🧠 Konsep Move Lanjutan dalam Tamagosui

### 1. Model Penyimpanan Object-Centric
Berbeda dengan blockchain tradisional yang menggunakan global storage, Sui menggunakan object-centric storage. Kontrak Tamagosui mendemonstrasikan konsep ini:

**Blockchain Tradisional (Account-Based):**
```solidity
// Ethereum Style - global mapping
mapping(address => Pet) public pets;
mapping(uint256 => Item) public items;
```

**Sui Object-Centric:**
```move
// Segala sesuatu adalah objek dengan ID unik (wajib memiliki ability key dengan field id: UID )
public struct Pet has key, store {
    id: UID,
    name: String,
    image_url: String,
    adopted_at: u64,
    stats: PetStats,
    game_data: PetGameData,
}

public struct PetAccessory has key, store {
    id: UID,
    name: String,
    image_url: String
}
```

**Keuntungan Utama:**
- **Tidak Ada Konflik Global State:** Setiap pet dapat diproses secara independen
- **Ownership yang Jelas:** Setiap pet milik owner tertentu
- **Type Safety:** Pet dan aksesori memiliki tipe yang kuat
- **Akses Efisien:** Akses langsung ke pet tanpa pencarian global state

> **References:**
> - [Sui Objects - Object Model](https://docs.sui.io/concepts/object-model)

### 2. Shared Objects vs Owned Objects
Memahami ownership objek sangat penting untuk aplikasi gaming:

```move
// Owned object - hanya owner yang bisa berinteraksi (tidak perlu konsensus)
transfer::public_transfer(pet, ctx.sender());

// Di Tamagosui, pet adalah owned object - hanya owner yang bisa:
// - Memberi makan pet
// - Bermain dengan pet  
// - Menyuruh pet bekerja
// - Memasang/melepas aksesori
```

**Kapan Menggunakan Masing-masing type object:**
- **Owned:** Pet individual, aksesori, profil user (seperti di Tamagosui)
- **Shared:** Leaderboard game, marketplace, sistem multi-user  
- **Immutable:** Konfigurasi game, gambar evolusi pet

> **References:**
> - [Sui Objects - Object Ownership ](https://docs.sui.io/concepts/object-ownership)
> - [Sui Objects - Object Ownership 2](https://docs.sui.io/guides/developer/sui-101/object-ownership)
> - [Move Book - Ownership](https://move-book.com/object/ownership/)
> - [Move Book - Resources](https://move-book.com/reference/structs)
> - [Sui Objects - Transfer](https://docs.sui.io/concepts/transfers)

### 3. Dynamic Fields: Kustomisasi Pet Tanpa Batas
Dynamic fields memungkinkan penyimpanan data tanpa batas tanpa mengetahui nama field saat compile time. Tamagosui menggunakan ini untuk:

```move
use sui::dynamic_field as df;

const EQUIPPED_ITEM_KEY: vector<u8> = b"equipped_item";
const SLEEP_STARTED_AT_KEY: vector<u8> = b"sleep_started_at";

// Simpan aksesori di dalam pet tanpa mengubah struct Pet
public entry fun equip_accessory(pet: &mut Pet, accessory: PetAccessory) {
    let key = string::utf8(EQUIPPED_ITEM_KEY);
    dynamic_field::add(&mut pet.id, key, accessory);
    update_pet_image(pet); // Mengubah tampilan berdasarkan item yang dipasang
}

// Simpan timestamp tidur untuk kalkulasi durasi
public entry fun let_pet_sleep(pet: &mut Pet, clock: &Clock) {
    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    dynamic_field::add(&mut pet.id, key, clock.timestamp_ms());
}

// Cek apakah pet memiliki aksesori terpasang
fun has_accessory_equipped(pet: &Pet): bool {
    let key = string::utf8(EQUIPPED_ITEM_KEY);
    dynamic_field::exists_<String>(&pet.id, key)
}
```

**Kasus Penggunaan Tamagosui:**
- **Accessories:** Simpan kacamata, topi, atau item lain di dalam pet
- **Status Tidur:** Lacak kapan pet mulai tidur untuk recovery energy
- **Ekstensibilitas Masa Depan:** Tambah fitur pet baru tanpa mengubah struct inti

> **References:**
> - [Sui Dynamic Fields Concept](https://docs.sui.io/concepts/dynamic-fields)
> - [Move Book - Dynamic Object Fields](https://move-book.com/programmability/dynamic-object-fields/)


### 4. Clock Object: Mekanik Pet Berbasis Waktu
Sui memiliki Clock object, semacam "jam global" on-chain yang bisa digunakan semua orang untuk handle hal-hal yang butuh timing:

```move
use sui::clock::{Self, Clock};

// Adopsi pet dengan timestamp
public entry fun adopt_pet(
    name: String,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let current_time = clock.timestamp_ms();
    
    let pet = Pet {
        id: object::new(ctx),
        name,
        image_url: string::utf8(PET_LEVEL_1_IMAGE_URL),
        adopted_at: current_time, // Catat kapan pet diadopsi
        stats: PetStats { energy: 60, happiness: 50, hunger: 40 },
        game_data: PetGameData { coins: 20, experience: 0, level: 1 }
    };
    
    transfer::public_transfer(pet, ctx.sender());
}

// Sistem tidur dengan recovery berbasis durasi
public entry fun wake_up_pet(pet: &mut Pet, clock: &Clock) {
    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    let sleep_started_at: u64 = dynamic_field::remove<String, u64>(&mut pet.id, key);
    let duration_ms = clock.timestamp_ms() - sleep_started_at;
    
    let gb = get_game_balance();
    
    // Hitung energy yang didapat berdasarkan durasi tidur
    let energy_gained = duration_ms / gb.sleep_energy_gain_ms; // 1 energy per detik
    pet.stats.energy = if (pet.stats.energy + energy_gained > gb.max_stat) 
        gb.max_stat 
    else 
        pet.stats.energy + energy_gained;
    
    // Juga hitung kehilangan happiness dan hunger selama tidur
    // Ini menciptakan mekanik perawatan pet yang realistis
}
```

**Properti Clock Object:**
- **Singleton object** dengan ID 0x6
- **Akses read-only** ke timestamp saat ini  
- **Waktu berbasis konsensus** (bukan waktu mesin lokal)
- **Presisi milidetik** untuk mekanik game yang akurat

**Pola Berbasis Waktu Tamagosui:**
- **Adopsi Pet:** Catat waktu adopsi yang tepat
- **Mekanik Tidur:** Recovery energy seiring waktu
- **Decay Stat:** Pet menjadi lapar/lelah seiring waktu (fitur masa depan)
- **Evolusi:** Pertumbuhan pet berbasis waktu (fitur masa depan)

> **References:**
> - [Clock Module Reference](https://docs.sui.io/references/framework/sui_sui/clock)
> - [Move Book - Time in Sui](https://move-book.com/programmability/epoch-and-time/#time)

### 5. Module Initializers: Setup Game Satu Kali
Fungsi init berjalan tepat sekali ketika module Tamagosui dipublish:

```move
public struct TAMAGOSUI has drop {} // One-Time Witness

fun init(witness: TAMAGOSUI, ctx: &mut TxContext) {
    let publisher = package::claim(witness, ctx);

    // Setup bagaimana pet muncul di wallet dan marketplace
    let pet_keys = vector[
        string::utf8(b"name"),
        string::utf8(b"image_url"),
        string::utf8(b"birth_date"),
        string::utf8(b"experience"),
        string::utf8(b"level"),
    ];

    let pet_values = vector[
        string::utf8(b"{name}"),
        string::utf8(b"{image_url}"),
        string::utf8(b"{adopted_at}"),
        string::utf8(b"{game_data.experience}"),
        string::utf8(b"{game_data.level}"),
    ];

    let mut pet_display = display::new_with_fields<Pet>(&publisher, pet_keys, pet_values, ctx);
    pet_display.update_version();
    transfer::public_transfer(pet_display, ctx.sender());

    // Setup display aksesori
    let accessory_keys = vector[
        string::utf8(b"name"),
        string::utf8(b"image_url")
    ];
    let accessory_values = vector[
        string::utf8(b"{name}"),
        string::utf8(b"{image_url}")
    ];
    let mut accessory_display = display::new_with_fields<PetAccessory>(&publisher, accessory_keys, accessory_values, ctx);
    accessory_display.update_version();
    transfer::public_transfer(accessory_display, ctx.sender());

    transfer::public_transfer(publisher, ctx.sender());
}
```

> **References:**
> - [Move Book - Module Initializer](https://move-book.com/programmability/module-initializer/)
> - [Sui Module Initializer](https://docs.sui.io/concepts/sui-move-concepts#module-initializers)
> - [Move Book - One-Time Witness](https://move-book.com/programmability/one-time-witness/)
> - [Module Publishing](https://move-book.com/your-first-move/hello-sui/#publish)

### 6. Entry Functions vs Public Functions dalam Gaming
Memahami visibility fungsi untuk mekanik game:

```move
// Entry function - pemain panggil langsung dari wallet/CLI
public entry fun feed_pet(pet: &mut Pet) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);
    
    let gb = get_game_balance();
    assert!(pet.stats.hunger < gb.max_stat, E_PET_NOT_HUNGRY);
    assert!(pet.game_data.coins >= gb.feed_coins_cost, E_NOT_ENOUGH_COINS);

    // Kurangi koin dan tingkatkan hunger
    pet.game_data.coins = pet.game_data.coins - gb.feed_coins_cost;
    pet.stats.hunger = if (pet.stats.hunger + gb.feed_hunger_gain > gb.max_stat)
        gb.max_stat else pet.stats.hunger + gb.feed_hunger_gain;
        
    emit_action(pet, b"fed");
}

// Public function - modul lain bisa panggil dan dapat return value
public fun get_pet_stats(pet: &Pet): (u8, u8, u8) {
    (pet.stats.energy, pet.stats.hunger, pet.stats.happiness)
}

public fun is_sleeping(pet: &Pet): bool {
    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    dynamic_field::exists_<String>(&pet.id, key)
}

// Internal function - hanya dalam modul ini
fun update_pet_image(pet: &mut Pet) {
    let key = string::utf8(EQUIPPED_ITEM_KEY);
    let has_accessory = dynamic_field::exists_<String>(&pet.id, key);
    
    // Update gambar berdasarkan level dan aksesori terpasang
    if (pet.game_data.level == 1) {
        if (has_accessory) {
            pet.image_url = string::utf8(PET_LEVEL_1_IMAGE_WITH_GLASSES_URL);
        } else {
            pet.image_url = string::utf8(PET_LEVEL_1_IMAGE_URL);
        }
    }
    // ... logic level lainnya
}
```
> **References:**
> - [Move Book - Function Visibility](https://move-book.com/move-basics/visibility/)
> - [Sui Move - Entry Functions](https://docs.sui.io/concepts/sui-move-concepts#entry-functions)

### 7. Teknik Optimasi Gas untuk Gaming

**1. Struktur Data Efisien:**
```move
// Good: Organisir stat dalam nested struct
public struct Pet has key, store {
    id: UID,
    name: String,
    image_url: String,
    adopted_at: u64,
    stats: PetStats,        // Kelompokkan data terkait
    game_data: PetGameData, // Kelompokkan data terkait
}

public struct PetStats has store {
    energy: u8,     // Gunakan tipe terkecil yang memungkinkan
    happiness: u8,
    hunger: u8,
}

// Daripada field terpisah tersebar di struct Pet
```

**2. Konfigurasi Game Terpusat:**
```move
public struct GameBalance has copy, drop {
    max_stat: u8,
    feed_coins_cost: u64,
    feed_experience_gain: u64,
    feed_hunger_gain: u8,
    // ... semua parameter game di satu tempat
}

fun get_game_balance(): GameBalance {
    GameBalance {
        max_stat: 100,
        feed_coins_cost: 5,
        feed_experience_gain: 5,
        // ... inisialisasi sekali per pemanggilan fungsi
    }
}
```

**3. Operasi Batch (Peningkatan Masa Depan):**
```move
// Daripada aksi pet individual
public entry fun batch_feed_pets(pets: vector<&mut Pet>) {
    let gb = get_game_balance(); // Hitung sekali
    let mut i = 0;
    while (i < vector::length(&pets)) {
        let pet = vector::borrow_mut(&mut pets, i);
        // Feed setiap pet menggunakan game balance yang sama
        i = i + 1;
    };
}
```

> **References:**
> - [Sui Gas Pricing](https://docs.sui.io/concepts/sui-move-concepts#entry-functions)

```

## ✅ Latihan: Memahami Smart Contract Tamagosui (90 menit)

### Langkah 1: Analisis Struktur Kontrak (20 menit)

Periksa komponen utama kontrak Tamagosui:

```move
module 0x0::tamagosui;

// === Konstanta Error ===
const E_NOT_ENOUGH_COINS: u64 = 101;
const E_PET_NOT_HUNGRY: u64 = 102;
// ... kode error lainnya

// === Struct Inti ===
public struct Pet has key, store {
    id: UID,
    name: String,
    image_url: String,
    adopted_at: u64,
    stats: PetStats,
    game_data: PetGameData,
}

// === Konfigurasi Game Balance ===
public struct GameBalance has copy, drop {
    max_stat: u8,
    feed_coins_cost: u64,
    // ... semua parameter game
}
```

**Pertanyaan Kunci untuk Eksplorasi:**
1. Mengapa kode error didefinisikan sebagai konstanta?
2. Ability apa yang dimiliki struct `Pet` dan mengapa?
3. Bagaimana struct `GameBalance` membantu maintainability?

### Langkah 2: Memahami Siklus Hidup Pet (25 menit)

Telusuri siklus hidup pet yang lengkap:

```move
// 1. Adopsi Pet
public entry fun adopt_pet(name: String, clock: &Clock, ctx: &mut TxContext)

// 2. Aksi Perawatan Dasar  
public entry fun feed_pet(pet: &mut Pet)
public entry fun play_with_pet(pet: &mut Pet)
public entry fun work_for_coins(pet: &mut Pet)

// 3. Sistem Tidur
public entry fun let_pet_sleep(pet: &mut Pet, clock: &Clock)
public entry fun wake_up_pet(pet: &mut Pet, clock: &Clock)

// 4. Progression
public entry fun check_and_level_up(pet: &mut Pet)

// 5. Kustomisasi
public entry fun equip_accessory(pet: &mut Pet, accessory: PetAccessory)
```

**Tugas Hands-on:**
1. Deploy kontrak Tamagosui ke testnet
2. Adopsi pet pertama kamu
3. Berinteraksi dengan pet kamu (feed, play, work)
4. Tidurkan pet dan bangunkan
5. Level up pet kamu
6. Mint dan pasang accessories

### Langkah 3: Deep Dive Dynamic Fields (25 menit)

Eksplorasi bagaimana dynamic fields bekerja dalam praktik:

```move
// Periksa sistem tidur
const SLEEP_STARTED_AT_KEY: vector<u8> = b"sleep_started_at";

public entry fun let_pet_sleep(pet: &mut Pet, clock: &Clock) {
    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    dynamic_field::add(&mut pet.id, key, clock.timestamp_ms());
    pet.image_url = string::utf8(PET_SLEEP_IMAGE_URL);
}

public fun is_sleeping(pet: &Pet): bool {
    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    dynamic_field::exists_<String>(&pet.id, key)
}
```

**Eksperimen dengan:**
1. Cek apakah pet sedang tidur menggunakan `is_sleeping()`
2. Pahami bagaimana durasi tidur mempengaruhi recovery stat
3. Eksplorasi sistem aksesori menggunakan dynamic fields

### Langkah 4: Analisis Mekanik Berbasis Waktu (20 menit)

Pahami bagaimana Clock object memungkinkan mekanik game:

```move
public entry fun wake_up_pet(pet: &mut Pet, clock: &Clock) {
    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    let sleep_started_at: u64 = dynamic_field::remove<String, u64>(&mut pet.id, key);
    let duration_ms = clock.timestamp_ms() - sleep_started_at;
    
    let gb = get_game_balance();
    
    // Recovery energy: 1 poin per detik
    let energy_gained = duration_ms / gb.sleep_energy_gain_ms;
    
    // Decay happiness: 1 poin per 0.7 detik  
    let happiness_lost = duration_ms / gb.sleep_happiness_loss_ms;
    
    // Decay hunger: 1 poin per 0.5 detik
    let hunger_lost = duration_ms / gb.sleep_hunger_loss_ms;
    
    // Aplikasikan perubahan yang dihitung dengan bounds checking
    // ...
}
```

**Skenario Test:**
1. Tidurkan pet untuk durasi berbeda
2. Observasi bagaimana stat berubah berdasarkan waktu tidur
3. Hitung durasi tidur optimal untuk situasi berbeda

## 🎮 Pola Gaming Lanjutan dalam Tamagosui

### 1. Pola State Machine
```move
// Pet bisa dalam state berbeda yang mempengaruhi aksi yang tersedia
pub fun is_sleeping(pet: &Pet): bool // State tidur
// Aksi dibatasi berdasarkan state:
assert!(!is_sleeping(pet), E_PET_IS_ASLEEP); // Di feed_pet(), play_with_pet(), dll.
```

### 2. Progressive Disclosure
```move
// Kemampuan pet terbuka berdasarkan level
fun update_pet_image(pet: &mut Pet) {
    if (pet.game_data.level == 1) {
        // Opsi tampilan Level 1
    } else if (pet.game_data.level == 2) {
        // Opsi tampilan Level 2  
    } else if (pet.game_data.level >= 3) {
        // Opsi tampilan Level 3+
    }
}
```

### 3. Resource Management
```move
// Multiple resource yang saling terkait
public struct PetStats has store {
    energy: u8,    // Dikonsumsi oleh play dan work
    happiness: u8, // Didapat dari play, hilang dari work dan sleep
    hunger: u8,    // Hilang dari play dan work, didapat dari feeding
}

// Aksi memiliki multiple cost/benefit resource
pub entry fun play_with_pet(pet: &mut Pet) {
    pet.stats.energy = pet.stats.energy - gb.play_energy_loss;      // Butuh energy
    pet.stats.hunger = pet.stats.hunger - gb.play_hunger_loss;      // Butuh hunger  
    pet.stats.happiness = pet.stats.happiness + gb.play_happiness_gain; // Dapat happiness
    pet.game_data.experience = pet.game_data.experience + gb.play_experience_gain; // Dapat XP
}
```

### 4. Event-Driven Architecture
```move
// Event memungkinkan pengalaman off-chain yang kaya
public struct PetAction has copy, drop {
    pet_id: ID,
    action: String,
    energy: u8,
    happiness: u8,
    hunger: u8
}

// Diemit setelah setiap aksi untuk update UI dan analytics
fun emit_action(pet: &Pet, action: vector<u8>) {
    event::emit(PetAction {
        pet_id: object::id(pet),
        action: string::utf8(action),
        energy: pet.stats.energy,
        happiness: pet.stats.happiness,
        hunger: pet.stats.hunger,
    });
}
```

## 📚 Poin Penting untuk Pengembangan Gaming Move

### 1. **Object Ownership Memungkinkan True Ownership**
- Pemain benar-benar memiliki pet mereka sebagai objek Sui
- Tidak ada otoritas pusat yang bisa mengambil atau memodifikasi pet
- Pet bisa ditransfer, dijual, atau digunakan di game lain

### 2. **Dynamic Fields Memungkinkan Ekstensibilitas**  
- Tambah fitur baru tanpa mengubah struct inti
- Simpan aksesori, achievement, atau data custom
- Desain game yang future-proof

### 3. **Mekanik Berbasis Waktu Terasa Natural**
- Waktu blockchain memungkinkan gameplay yang adil dan berbasis konsensus
- Siklus tidur/bangun menciptakan pola interaksi harian yang engaging
- Kalkulasi berbasis durasi reward pemikiran strategis

### 4. **Event Memungkinkan Pengalaman Kaya**
- Service off-chain bisa membangun UI kaya menggunakan data event
- Analytics dan leaderboard menjadi mungkin
- Fitur sosial bisa dibangun di sekitar aktivitas pet

### 5. **Resource Management Menciptakan Depth**
- Multiple stat yang saling terkait menciptakan pilihan meaningful
- Pemain harus menyeimbangkan prioritas yang berkompetisi (energy vs happiness vs hunger)
- Sistem ekonomi muncul secara natural (koin untuk feeding)

## 🚀 Langkah Selanjutnya: Memperluas Tamagosui

### Ekstensi Pemula
1. **Aksi Pet Baru:** Tambah aksi "exercise", "study", atau "rest"
2. **Lebih Banyak Aksesori:** Buat topi, pakaian, atau mainan
3. **Kepribadian Pet:** Tambah trait yang mempengaruhi outcome aksi

### Ekstensi Menengah  
1. **Evolusi Pet:** Transform pet pada level tertentu
2. **Sistem Breeding:** Gabungkan dua pet untuk membuat keturunan
3. **Marketplace:** Biarkan pemain trade pet dan aksesori

### Ekstensi Lanjutan
1. **Gameplay Multi-Pet:** Battle pet, race, atau kompetisi  
2. **Sistem Guild:** Pemain membentuk grup dengan tujuan bersama
3. **Integrasi Cross-Game:** Gunakan pet di multiple game

## 🧪 Uji Pemahaman

### Pertanyaan Quiz
1. Apa yang terjadi jika kamu menghapus ability `store` dari `PetStats`?
2. Mengapa Clock object adalah shared object bukan owned object?
3. Bagaimana kamu akan menambah sistem "mood" yang berubah berdasarkan aksi terbaru?
4. Optimasi gas apa yang bisa kamu aplikasikan pada kontrak saat ini?

### Tantangan Praktis
1. **Tantangan Desain:** Bagaimana kamu akan implementasi breeding pet?
2. **Tantangan Gas:** Optimasi fungsi `wake_up_pet` untuk penggunaan gas yang lebih baik
3. **Tantangan UX:** Desain sistem happiness pet yang mendorong interaksi harian
4. **Tantangan Security:** Identifikasi potential attack vector di kontrak saat ini

---

## Navigation
- [Implementation Code](./Tamagosui_code_implementation.md)