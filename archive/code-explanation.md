# Penjelasan Kode Smart Contract Tamagosui

Dokumen ini menjelaskan secara detail tentang implementasi smart contract Tamagosui dengan fokus pada konsep-konsep Move dan Sui yang digunakan.

## Daftar Isi
1. [Struktur Dasar](#struktur-dasar)
2. [Tipe dan Kemampuan (Abilities)](#tipe-dan-kemampuan)
3. [Dynamic Fields](#dynamic-fields)
4. [Mekanik Berbasis Waktu](#mekanik-berbasis-waktu)
5. [Events dan Pengamatan](#events-dan-pengamatan)
6. [Game Logic dan Balancing](#game-logic-dan-balancing)
7. [Best Practices dan Optimasi](#best-practices-dan-optimasi)

## Struktur Dasar

### Module Declaration dan Dependencies
```move
module 0x0::tamagosui;

use std::string::{Self, String};
use sui::{clock::Clock, display, dynamic_field, event, package};
```

Kode dimulai dengan deklarasi modul dan import dependencies. Beberapa poin penting:
- Modul dideklarasikan dengan address placeholder `0x0` yang akan diganti saat deployment
- Menggunakan dependencies dari standard library (`std`) dan Sui framework (`sui`)
- `Clock` digunakan untuk mekanik berbasis waktu
- `display` untuk konfigurasi tampilan NFT di wallet/marketplace
- `dynamic_field` untuk menyimpan data tambahan pada objek
- `event` untuk emisi event yang bisa ditangkap off-chain
- `package` untuk publikasi modul

### Konstanta dan Error Codes

```move
const E_NOT_ENOUGH_COINS: u64 = 101;
const E_PET_NOT_HUNGRY: u64 = 102;
const E_PET_TOO_TIRED: u64 = 103;
// ... kode error lainnya
```

Error codes didefinisikan sebagai konstanta untuk:
- Memudahkan tracking error saat development
- Membuat kode lebih readable dan maintainable
- Memungkinkan error handling yang konsisten di front-end
- Mengikuti best practice Sui untuk error handling

## Tipe dan Kemampuan

### Struct Pet dan Abilities-nya
```move
public struct Pet has key, store {
    id: UID,
    name: String,
    image_url: String,
    adopted_at: u64,
    stats: PetStats,
    game_data: PetGameData,
}
```

Abilities yang digunakan:
- `key`: Memungkinkan Pet menjadi top-level object di Sui storage
- `store`: Memungkinkan Pet disimpan dalam koleksi/field object lain

Mengapa struktur ini efektif:
- Object-centric storage model Sui
- Pet sebagai NFT yang bisa dimiliki dan ditransfer
- Modular dengan nested structs untuk stats dan game data

### Nested Structs
```move
public struct PetStats has store {
    energy: u8,
    happiness: u8,
    hunger: u8,
}

public struct PetGameData has store {
    coins: u64,
    experience: u64,
    level: u8,
}
```

Manfaat struktur nested:
- Organisasi data yang lebih baik
- Pemisahan concerns (stats vs progression)
- Optimasi gas dengan pengelompokan data terkait
- Kemudahan maintenance dan upgrade

## Dynamic Fields

### Sistem Aksesori
```move
const EQUIPPED_ITEM_KEY: vector<u8> = b"equipped_item";

public entry fun equip_accessory(pet: &mut Pet, accessory: PetAccessory) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);
    let key = string::utf8(EQUIPPED_ITEM_KEY);
    dynamic_field::add(&mut pet.id, key, accessory);
    update_pet_image(pet);
}
```

Keuntungan menggunakan dynamic fields:
- Ekstensibilitas: Tambah fitur tanpa modifikasi struct
- Efisiensi storage: Data optional tidak perlu selalu ada
- Fleksibilitas: Mudah menambah tipe aksesori baru

### Sistem Tidur
```move
const SLEEP_STARTED_AT_KEY: vector<u8> = b"sleep_started_at";

public entry fun let_pet_sleep(pet: &mut Pet, clock: &Clock) {
    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    dynamic_field::add(&mut pet.id, key, clock.timestamp_ms());
}
```

Implementasi menggunakan dynamic fields memungkinkan:
- State management yang efisien
- Data sementara yang tidak perlu selalu ada
- Kalkulasi berbasis durasi yang akurat

## Mekanik Berbasis Waktu

### Clock Object Usage
```move
public entry fun wake_up_pet(pet: &mut Pet, clock: &Clock) {
    let sleep_started_at: u64 = dynamic_field::remove<String, u64>(&mut pet.id, key);
    let duration_ms = clock.timestamp_ms() - sleep_started_at;
    // ... kalkulasi perubahan stats
}
```

Manfaat Clock object:
- Timestamp konsisten on-chain
- Mekanik berbasis waktu yang fair
- Pencegahan manipulasi waktu
- Presisi milidetik untuk kalkulasi akurat

## Events dan Pengamatan

### Event Structures
```move
public struct PetAction has copy, drop {
    pet_id: ID,
    action: String,
    energy: u8,
    happiness: u8,
    hunger: u8
}
```

Kegunaan events:
- Tracking aktivitas pet
- Update UI real-time
- Analytics dan monitoring
- Integrasi dengan sistem eksternal

### Event Emission
```move
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

Best practices event emission:
- Emit setelah setiap aksi penting
- Sertakan data yang relevan untuk UI
- Konsisten dalam format dan struktur
- Efisien dalam penggunaan storage

## Game Logic dan Balancing

### Game Balance Configuration
```move
public struct GameBalance has copy, drop {
    max_stat: u8,
    feed_coins_cost: u64,
    feed_experience_gain: u64,
    // ... parameter lainnya
}
```

Manfaat sentralisasi game balance:
- Mudah di-tune dan dioptimasi
- Konsistensi antar mekanik
- Kemudahan maintenance
- Fleksibilitas untuk perubahan

### Progression System
```move
public entry fun check_and_level_up(pet: &mut Pet) {
    let required_exp = (pet.game_data.level as u64) * gb.exp_per_level;
    assert!(pet.game_data.experience >= required_exp, E_NOT_ENOUGH_EXP);
    pet.game_data.level = pet.game_data.level + 1;
}
```

Fitur sistem progression:
- Level-based progression
- Experience gathering
- Visual evolution
- Reward system

## Best Practices dan Optimasi

### Gas Optimization
1. **Struktur Data Efisien**
   - Pengelompokan data terkait
   - Penggunaan tipe data yang tepat
   - Dynamic fields untuk data opsional

2. **Batching Operations**
   - Minimalisasi jumlah transaksi
   - Reuse data yang sudah diambil
   - Efisiensi dalam kalkulasi

3. **Storage Management**
   - Penggunaan dynamic fields secara bijak
   - Cleanup data yang tidak diperlukan
   - Optimasi struktur data

### Security Considerations
1. **Access Control**
   - Pemeriksaan ownership
   - Validasi input
   - State checks

2. **Error Handling**
   - Error codes yang jelas
   - Validasi yang komprehensif
   - Recovery mechanisms

3. **Resource Management**
   - Safe math operations
   - Bounds checking
   - Resource tracking

## Navigation
- [Implementation Code](../README.md)
