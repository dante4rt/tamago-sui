# Workshop Tamagosui - Pengembangan Smart Contract Move Tingkat Lanjut by Rama

## 🚀 Modul 3: Advanced Smart Contract Development with Tamagosui

### 🎯 Tujuan Pembelajaran

Di akhir modul ini, Anda akan dapat:

- Mempelajari fitur-fitur lanjutan Sui dan Move melalui pembuatan game pet virtual ala Tamagotchi
- Memahami ownership, dynamic fields, dan logika berbasis waktu dalam praktik
- Membangun sistem pet virtual lengkap dengan metadata dan aksesori
- Menerapkan teknik optimasi gas untuk aplikasi gaming

---

## Tamagotchi Smart Contract - Step by Step Implementation

## Prerequisites

- Sui CLI terinstal
- Text editor (VS Code dengan Move extension direkomendasikan)
- Pemahaman dasar tentang blockchain dan Move language

---

## Step 1: Create Project Structure

```bash
# Create main project directory
mkdir tamagosui
cd tamagosui

# Create contract directory
sui move new tamagosui_contract
cd tamagosui_contract
```

## Step 2: Configure `Move.toml`:

```toml
[package]
name = "tamagosui"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
tamagosui = "0x0"

[dev-dependencies]

[dev-addresses]

```

## Step 3: Implementasi Smart Contract Tamagosui

Buat file `sources/tamagosui.move` dan mulai dengan deklarasi module dan import yang diperlukan:

```move
module 0x0::tamagosui;

use std::string::{Self, String};
use sui::{clock::Clock, display, dynamic_field, event, package};
```

## Step 4: Constants dan Error Codes

Tambahkan konstanta untuk error handling dan asset URLs:

```move
// === Errors ===
const E_NOT_ENOUGH_COINS: u64 = 101;
const E_PET_NOT_HUNGRY: u64 = 102;
const E_PET_TOO_TIRED: u64 = 103;
const E_PET_TOO_HUNGRY: u64 = 104;
const E_ITEM_ALREADY_EQUIPPED: u64 = 105;
const E_NO_ITEM_EQUIPPED: u64 = 106;
const E_NOT_ENOUGH_EXP: u64 = 107;
const E_PET_IS_ASLEEP: u64 = 108;
const E_PET_IS_ALREADY_ASLEEP: u64 = 109;

// === Constants ===
const PET_LEVEL_1_IMAGE_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreidkhjpthergw2tcg6u5r344shgi2cdg5afmhgpf5bv34vqfrr7hni";
const PET_LEVEL_1_IMAGE_WITH_GLASSES_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreibizappmcjaq5a5metl27yc46co4kxewigq6zu22vovwvn5qfsbiu";
const PET_LEVEL_2_IMAGE_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreia5tgsowzfu6mzjfcxagfpbkghfuho6y5ybetxh3wabwrc5ajmlpq";
const PET_LEVEL_2_IMAGE_WITH_GLASSES_URL:vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreif5bkpnqyybq3aqgafqm72x4wfjwcuxk33vvykx44weqzuilop424";
const PET_LEVEL_3_IMAGE_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreidnqerfwxuxkrdsztgflmg5jwuespdkrazl6qmk7ykfgmrfzvinoy";
const PET_LEVEL_3_IMAGE_WITH_GLASSES_URL:vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreigs6r3rdupoji7pqmpwe76z7wysguzdlq43t3wqmzi2654ux5n6uu";
const PET_SLEEP_IMAGE_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreihwofl5stihtzjixfhrtznd7zqkclfhmlshgsg7cbszzjqqpvf7ae";
const ACCESSORY_GLASSES_IMAGE_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreigyivmq45od3jkryryi3w6t5j65hcnfh5kgwpi2ex7llf2i6se7de";

const EQUIPPED_ITEM_KEY: vector<u8> = b"equipped_item";
const SLEEP_STARTED_AT_KEY: vector<u8> = b"sleep_started_at";
```

## Step 5: Game Balance Configuration

Tambahkan struct untuk mengatur balance game:

```move
// === Game Balance ===
public struct GameBalance has copy, drop {
    max_stat: u8,

    // Feed settings
    feed_coins_cost: u64,
    feed_experience_gain: u64,
    feed_hunger_gain: u8,

    // Play settings
    play_energy_loss: u8,
    play_hunger_loss: u8,
    play_experience_gain: u64,
    play_happiness_gain: u8,

    // Work settings
    work_energy_loss: u8,
    work_happiness_loss: u8,
    work_hunger_loss: u8,
    work_coins_gain: u64,
    work_experience_gain: u64,

    // Sleep settings (in milliseconds)
    sleep_energy_gain_ms: u64,
    sleep_happiness_loss_ms: u64,
    sleep_hunger_loss_ms: u64,

    // Level settings
    exp_per_level: u64,
}

fun get_game_balance(): GameBalance {
    GameBalance {
        max_stat: 100,

        // Feed
        feed_coins_cost: 5,
        feed_experience_gain: 5,
        feed_hunger_gain: 20,

        // Play
        play_energy_loss: 15,
        play_hunger_loss: 15,
        play_experience_gain: 10,
        play_happiness_gain: 25,

        // Work
        work_energy_loss: 20,
        work_hunger_loss: 20,
        work_happiness_loss: 20,
        work_coins_gain: 10,
        work_experience_gain: 15,

        // Sleep (rates per millisecond)
        sleep_energy_gain_ms: 1000,    // 1 energy per second
        sleep_happiness_loss_ms: 700, // 1 happiness loss per 0.7 seconds
        sleep_hunger_loss_ms: 500,    // 1 hunger loss per 0.5 seconds

        // Level
        exp_per_level: 100,
    }
}
```

## Step 6: Core Data Structures

Definisikan struct utama untuk Pet dan komponennya:

```move
public struct TAMAGOSUI has drop {}

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

## Step 7: Events

Tambahkan struct untuk events:

```move
// === Events ===
public struct PetAdopted has copy, drop {
    pet_id: ID,
    name: String,
    adopted_at: u64
}

public struct PetAction has copy, drop {
    pet_id: ID,
    action: String,
    energy: u8,
    happiness: u8,
    hunger: u8
}
```

## Step 8: Module Initialization

Implement fungsi `init` untuk setup display dan publisher:

```move
fun init(witness: TAMAGOSUI, ctx: &mut TxContext) {
    let publisher = package::claim(witness, ctx);

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

## Step 9: Pet Adoption Function

Implement fungsi untuk mengadopsi pet:

```move
public entry fun adopt_pet(
    name: String,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let current_time = clock.timestamp_ms();

    let pet_stats = PetStats {
        energy: 60,
        happiness: 50,
        hunger: 40,
    };

    let pet_game_data = PetGameData {
        coins: 20,
        experience: 0,
        level: 1
    };

    let pet = Pet {
        id: object::new(ctx),
        name,
        image_url: string::utf8(PET_LEVEL_1_IMAGE_URL),
        adopted_at: current_time,
        stats: pet_stats,
        game_data: pet_game_data
    };

    let pet_id = object::id(&pet);

    event::emit(PetAdopted {
        pet_id: pet_id,
        name: pet.name,
        adopted_at: pet.adopted_at
    });

    transfer::public_transfer(pet, ctx.sender());
}
```

## Step 10: Basic Pet Care Functions

Implement fungsi dasar untuk merawat pet:

### Feed Pet Function:

```move
public entry fun feed_pet(pet: &mut Pet) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let gb = get_game_balance();

    assert!(pet.stats.hunger < gb.max_stat, E_PET_NOT_HUNGRY);
    assert!(pet.game_data.coins >= gb.feed_coins_cost, E_NOT_ENOUGH_COINS);

    pet.game_data.coins = pet.game_data.coins - gb.feed_coins_cost;
    pet.game_data.experience = pet.game_data.experience + gb.feed_experience_gain;
    pet.stats.hunger = if (pet.stats.hunger + gb.feed_hunger_gain > gb.max_stat)
        gb.max_stat
    else
        pet.stats.hunger + gb.feed_hunger_gain;

    emit_action(pet, b"fed");
}
```

### Play with Pet Function:

```move
public entry fun play_with_pet(pet: &mut Pet) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let gb = get_game_balance();
    assert!(pet.stats.energy >= gb.play_energy_loss, E_PET_TOO_TIRED);
    assert!(pet.stats.hunger >= gb.play_hunger_loss, E_PET_TOO_HUNGRY);

    pet.stats.energy = pet.stats.energy - gb.play_energy_loss;
    pet.stats.hunger = pet.stats.hunger - gb.play_hunger_loss;
    pet.game_data.experience = pet.game_data.experience + gb.play_experience_gain;
    pet.stats.happiness = if (pet.stats.happiness + gb.play_happiness_gain > gb.max_stat)
        gb.max_stat
    else
        pet.stats.happiness + gb.play_happiness_gain;

    emit_action(pet, b"played");
}
```

## Step 11: Work and Level System

### Work Function:

```move
public entry fun work_for_coins(pet: &mut Pet) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let gb = get_game_balance();

    assert!(pet.stats.energy >= gb.work_energy_loss, E_PET_TOO_TIRED);
    assert!(pet.stats.happiness >= gb.work_happiness_loss, E_PET_NOT_HUNGRY);
    assert!(pet.stats.hunger >= gb.work_hunger_loss, E_PET_TOO_HUNGRY);

    pet.stats.energy = if (pet.stats.energy >= gb.work_energy_loss)
        pet.stats.energy - gb.work_energy_loss
    else
        0;
    pet.stats.happiness = if (pet.stats.happiness >= gb.work_happiness_loss)
        pet.stats.happiness - gb.work_happiness_loss
    else
        0;
    pet.stats.hunger = if (pet.stats.hunger >= gb.work_hunger_loss)
        pet.stats.hunger - gb.work_hunger_loss
    else
        0;
    pet.game_data.coins = pet.game_data.coins + gb.work_coins_gain;
    pet.game_data.experience = pet.game_data.experience + gb.work_experience_gain;

    emit_action(pet, b"worked");
}
```

### Level Up Function:

```move
public entry fun check_and_level_up(pet: &mut Pet) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let gb = get_game_balance();

    // Calculate required exp: level * exp_per_level
    let required_exp = (pet.game_data.level as u64) * gb.exp_per_level;
    assert!(pet.game_data.experience >= required_exp, E_NOT_ENOUGH_EXP);

    // Level up
    pet.game_data.level = pet.game_data.level + 1;
    pet.game_data.experience = pet.game_data.experience - required_exp;

    // Update image based on level and equipped accessory
    update_pet_image(pet);

    emit_action(pet, b"leveled_up")
}
```

## Step 12: Sleep System

### Sleep Functions:

```move
public entry fun let_pet_sleep(pet: &mut Pet, clock: &Clock) {
    assert!(!is_sleeping(pet), E_PET_IS_ALREADY_ASLEEP);

    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    dynamic_field::add(&mut pet.id, key, clock.timestamp_ms());

    pet.image_url = string::utf8(PET_SLEEP_IMAGE_URL);

    emit_action(pet, b"started_sleeping");
}

public entry fun wake_up_pet(pet: &mut Pet, clock: &Clock) {
    assert!(is_sleeping(pet), E_PET_IS_ASLEEP);

    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    let sleep_started_at: u64 = dynamic_field::remove<String, u64>(&mut pet.id, key);
    let duration_ms = clock.timestamp_ms() - sleep_started_at;

    let gb = get_game_balance();

    // Calculate energy gained
    let energy_gained_u64 = duration_ms / gb.sleep_energy_gain_ms;
    let energy_gained = if (energy_gained_u64 > (gb.max_stat as u64)) {
        gb.max_stat
    } else {
        (energy_gained_u64 as u8)
    };
    pet.stats.energy = if (pet.stats.energy + energy_gained > gb.max_stat) gb.max_stat else pet.stats.energy + energy_gained;

    // Calculate happiness lost
    let happiness_lost_u64 = duration_ms / gb.sleep_happiness_loss_ms;
    let happiness_lost = if (happiness_lost_u64 > (gb.max_stat as u64)) {
        gb.max_stat
    } else {
        (happiness_lost_u64 as u8)
    };
    pet.stats.happiness = if (pet.stats.happiness > happiness_lost) pet.stats.happiness - happiness_lost else 0;

    // Calculate hunger lost
    let hunger_lost_u64 = duration_ms / gb.sleep_hunger_loss_ms;
    let hunger_lost = if (hunger_lost_u64 > (gb.max_stat as u64)) {
        gb.max_stat
    } else {
        (hunger_lost_u64 as u8)
    };
    pet.stats.hunger = if (pet.stats.hunger > hunger_lost) pet.stats.hunger - hunger_lost else 0;

    update_pet_image(pet);

    emit_action(pet, b"woke_up");
}
```

## Step 13: Accessory System

### Mint dan Equip Accessories:

```move
public entry fun mint_accessory(ctx: &mut TxContext) {
    let accessory = PetAccessory {
        id: object::new(ctx),
        name: string::utf8(b"cool glasses"),
        image_url: string::utf8(ACCESSORY_GLASSES_IMAGE_URL)
    };
    transfer::public_transfer(accessory, ctx.sender());
}

public entry fun equip_accessory(pet: &mut Pet, accessory: PetAccessory) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let key = string::utf8(EQUIPPED_ITEM_KEY);
    assert!(!dynamic_field::exists_<String>(&pet.id, copy key), E_ITEM_ALREADY_EQUIPPED);

    // Add accessory to pet
    dynamic_field::add(&mut pet.id, key, accessory);
    // Update image
    update_pet_image(pet);
    emit_action(pet, b"equipped_item");
}

public entry fun unequip_accessory(pet: &mut Pet, ctx: &mut TxContext) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let key = string::utf8(EQUIPPED_ITEM_KEY);
    assert!(dynamic_field::exists_<String>(&pet.id, key), E_NO_ITEM_EQUIPPED);

    // Remove accessory
    let accessory: PetAccessory = dynamic_field::remove<String, PetAccessory>(&mut pet.id, key);
    // Update image
    update_pet_image(pet);

    transfer::transfer(accessory, ctx.sender());
    emit_action(pet, b"unequipped_item");
}
```

## Step 14: Helper Functions

### Emit Action dan Update Image:

```move
// === Helper Functions ===
fun emit_action(pet: &Pet, action: vector<u8>) {
    event::emit(PetAction {
        pet_id: object::id(pet),
        action: string::utf8(action),
        energy: pet.stats.energy,
        happiness: pet.stats.happiness,
        hunger: pet.stats.hunger,
    });
}

fun update_pet_image(pet: &mut Pet) {
    let key = string::utf8(EQUIPPED_ITEM_KEY);
    let has_accessory = dynamic_field::exists_<String>(&pet.id, key);

    if (pet.game_data.level == 1) {
        if (has_accessory) {
            pet.image_url = string::utf8(PET_LEVEL_1_IMAGE_WITH_GLASSES_URL);
        } else {
            pet.image_url = string::utf8(PET_LEVEL_1_IMAGE_URL);
        }
    } else if (pet.game_data.level == 2) {
        if (has_accessory) {
            pet.image_url = string::utf8(PET_LEVEL_2_IMAGE_WITH_GLASSES_URL);
        } else {
            pet.image_url = string::utf8(PET_LEVEL_2_IMAGE_URL);
        }
    } else if (pet.game_data.level >= 3) {
        if (has_accessory) {
            pet.image_url = string::utf8(PET_LEVEL_3_IMAGE_WITH_GLASSES_URL);
        } else {
            pet.image_url = string::utf8(PET_LEVEL_3_IMAGE_URL);
        }
    };
}
```

## Step 15: View Functions

Tambahkan fungsi untuk membaca data pet:

```move
// === View Functions ===
public fun get_pet_name(pet: &Pet): String { pet.name }
public fun get_pet_adopted_at(pet: &Pet): u64 { pet.adopted_at }
public fun get_pet_coins(pet: &Pet): u64 { pet.game_data.coins }
public fun get_pet_experience(pet: &Pet): u64 { pet.game_data.experience }
public fun get_pet_level(pet: &Pet): u8 { pet.game_data.level }
public fun get_pet_energy(pet: &Pet): u8 { pet.stats.energy }
public fun get_pet_hunger(pet: &Pet): u8 { pet.stats.hunger }
public fun get_pet_happiness(pet: &Pet): u8 { pet.stats.happiness }

public fun get_pet_stats(pet: &Pet): (u8, u8, u8) {
    (pet.stats.energy, pet.stats.hunger, pet.stats.happiness)
}
public fun get_pet_game_data(pet: &Pet): (u64, u64, u8) {
    (pet.game_data.coins, pet.game_data.experience, pet.game_data.level)
}

public fun is_sleeping(pet: &Pet): bool {
    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    dynamic_field::exists_<String>(&pet.id, key)
}
```

## Step 16: Test Function

Tambahkan fungsi untuk testing:

```move
// === Test-Only Functions ===
#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(TAMAGOSUI {}, ctx);
}
```

# ✅ Full Code Implementation

```move
module 0x0::tamagosui;

use std::string::{Self, String};
use sui::{clock::Clock, display, dynamic_field, event, package};

// === Errors ===
const E_NOT_ENOUGH_COINS: u64 = 101;
const E_PET_NOT_HUNGRY: u64 = 102;
const E_PET_TOO_TIRED: u64 = 103;
const E_PET_TOO_HUNGRY: u64 = 104;
const E_ITEM_ALREADY_EQUIPPED: u64 = 105;
const E_NO_ITEM_EQUIPPED: u64 = 106;
const E_NOT_ENOUGH_EXP: u64 = 107;
const E_PET_IS_ASLEEP: u64 = 108;
const E_PET_IS_ALREADY_ASLEEP: u64 = 109;

// === Constants ===
const PET_LEVEL_1_IMAGE_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreidkhjpthergw2tcg6u5r344shgi2cdg5afmhgpf5bv34vqfrr7hni";
const PET_LEVEL_1_IMAGE_WITH_GLASSES_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreibizappmcjaq5a5metl27yc46co4kxewigq6zu22vovwvn5qfsbiu";
const PET_LEVEL_2_IMAGE_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreia5tgsowzfu6mzjfcxagfpbkghfuho6y5ybetxh3wabwrc5ajmlpq";
const PET_LEVEL_2_IMAGE_WITH_GLASSES_URL:vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreif5bkpnqyybq3aqgafqm72x4wfjwcuxk33vvykx44weqzuilop424";
const PET_LEVEL_3_IMAGE_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreidnqerfwxuxkrdsztgflmg5jwuespdkrazl6qmk7ykfgmrfzvinoy";
const PET_LEVEL_3_IMAGE_WITH_GLASSES_URL:vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreigs6r3rdupoji7pqmpwe76z7wysguzdlq43t3wqmzi2654ux5n6uu";
const PET_SLEEP_IMAGE_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreihwofl5stihtzjixfhrtznd7zqkclfhmlshgsg7cbszzjqqpvf7ae";
const ACCESSORY_GLASSES_IMAGE_URL: vector<u8> = b"https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreigyivmq45od3jkryryi3w6t5j65hcnfh5kgwpi2ex7llf2i6se7de";

const EQUIPPED_ITEM_KEY: vector<u8> = b"equipped_item";
const SLEEP_STARTED_AT_KEY: vector<u8> = b"sleep_started_at";

// === Game Balance ===
public struct GameBalance has copy, drop {
    max_stat: u8,

    // Feed settings
    feed_coins_cost: u64,
    feed_experience_gain: u64,
    feed_hunger_gain: u8,

    // Play settings
    play_energy_loss: u8,
    play_hunger_loss: u8,
    play_experience_gain: u64,
    play_happiness_gain: u8,

    // Work settings
    work_energy_loss: u8,
    work_happiness_loss: u8,
    work_hunger_loss: u8,
    work_coins_gain: u64,
    work_experience_gain: u64,

    // Sleep settings (in milliseconds)
    sleep_energy_gain_ms: u64,
    sleep_happiness_loss_ms: u64,
    sleep_hunger_loss_ms: u64,

    // Level settings
    exp_per_level: u64,
}

fun get_game_balance(): GameBalance {
    GameBalance {
        max_stat: 100,

        // Feed
        feed_coins_cost: 5,
        feed_experience_gain: 5,
        feed_hunger_gain: 20,

        // Play
        play_energy_loss: 15,
        play_hunger_loss: 15,
        play_experience_gain: 10,
        play_happiness_gain: 25,

        // Work
        work_energy_loss: 20,
        work_hunger_loss: 20,
        work_happiness_loss: 20,
        work_coins_gain: 10,
        work_experience_gain: 15,

        // Sleep (rates per millisecond)
        sleep_energy_gain_ms: 1000,    // 1 energy per second
        sleep_happiness_loss_ms: 700, // 1 happiness loss per 0.7 seconds
        sleep_hunger_loss_ms: 500,    // 1 hunger loss per 0.5 seconds

        // Level
        exp_per_level: 100,
    }
}

public struct TAMAGOSUI has drop {}

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

// === Events ===

public struct PetAdopted has copy, drop {
    pet_id: ID,
    name: String,
    adopted_at: u64
}
public struct PetAction has copy, drop {
    pet_id: ID,
    action: String,
    energy: u8,
    happiness: u8,
    hunger: u8
}

fun init(witness: TAMAGOSUI, ctx: &mut TxContext) {
    let publisher = package::claim(witness, ctx);

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

public entry fun adopt_pet(
    name: String,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let current_time = clock.timestamp_ms();

    let pet_stats = PetStats {
        energy: 60,
        happiness: 50,
        hunger: 40,
    };

    let pet_game_data = PetGameData {
        coins: 20,
        experience: 0,
        level: 1
    };

    let pet = Pet {
        id: object::new(ctx),
        name,
        image_url: string::utf8(PET_LEVEL_1_IMAGE_URL),
        adopted_at: current_time,
        stats: pet_stats,
        game_data: pet_game_data
    };

    let pet_id = object::id(&pet);

    event::emit(PetAdopted {
        pet_id: pet_id,
        name: pet.name,
        adopted_at: pet.adopted_at
    });

    transfer::public_transfer(pet, ctx.sender());
}

public entry fun feed_pet(pet: &mut Pet) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let gb = get_game_balance();

    assert!(pet.stats.hunger < gb.max_stat, E_PET_NOT_HUNGRY);
    assert!(pet.game_data.coins >= gb.feed_coins_cost, E_NOT_ENOUGH_COINS);

    pet.game_data.coins = pet.game_data.coins - gb.feed_coins_cost;
    pet.game_data.experience = pet.game_data.experience + gb.feed_experience_gain;
    pet.stats.hunger = if (pet.stats.hunger + gb.feed_hunger_gain > gb.max_stat)
        gb.max_stat
    else
        pet.stats.hunger + gb.feed_hunger_gain;

    emit_action(pet, b"fed");
}

public entry fun play_with_pet(pet: &mut Pet) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let gb = get_game_balance();
    assert!(pet.stats.energy >= gb.play_energy_loss, E_PET_TOO_TIRED);
    assert!(pet.stats.hunger >= gb.play_hunger_loss, E_PET_TOO_HUNGRY);

    pet.stats.energy = pet.stats.energy - gb.play_energy_loss;
    pet.stats.hunger = pet.stats.hunger - gb.play_hunger_loss;
    pet.game_data.experience = pet.game_data.experience + gb.play_experience_gain;
    pet.stats.happiness = if (pet.stats.happiness + gb.play_happiness_gain > gb.max_stat)
        gb.max_stat
    else
        pet.stats.happiness + gb.play_happiness_gain;

    emit_action(pet, b"played");
}

public entry fun work_for_coins(pet: &mut Pet) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let gb = get_game_balance();

    assert!(pet.stats.energy >= gb.work_energy_loss, E_PET_TOO_TIRED);
    assert!(pet.stats.happiness >= gb.work_happiness_loss, E_PET_NOT_HUNGRY);
    assert!(pet.stats.hunger >= gb.work_hunger_loss, E_PET_TOO_HUNGRY);

    pet.stats.energy = if (pet.stats.energy >= gb.work_energy_loss)
        pet.stats.energy - gb.work_energy_loss
    else
        0;
    pet.stats.happiness = if (pet.stats.happiness >= gb.work_happiness_loss)
        pet.stats.happiness - gb.work_happiness_loss
    else
        0;
    pet.stats.hunger = if (pet.stats.hunger >= gb.work_hunger_loss)
        pet.stats.hunger - gb.work_hunger_loss
    else
        0;
    pet.game_data.coins = pet.game_data.coins + gb.work_coins_gain;
    pet.game_data.experience = pet.game_data.experience + gb.work_experience_gain;

    emit_action(pet, b"worked");
}

public entry fun let_pet_sleep(pet: &mut Pet, clock: &Clock) {
    assert!(!is_sleeping(pet), E_PET_IS_ALREADY_ASLEEP);

    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    dynamic_field::add(&mut pet.id, key, clock.timestamp_ms());

    pet.image_url = string::utf8(PET_SLEEP_IMAGE_URL);

    emit_action(pet, b"started_sleeping");
}

public entry fun wake_up_pet(pet: &mut Pet, clock: &Clock) {
    assert!(is_sleeping(pet), E_PET_IS_ASLEEP);

    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    let sleep_started_at: u64 = dynamic_field::remove<String, u64>(&mut pet.id, key);
    let duration_ms = clock.timestamp_ms() - sleep_started_at;

    let gb = get_game_balance();

    // Calculate energy gained
    let energy_gained_u64 = duration_ms / gb.sleep_energy_gain_ms;
    // Cap energy gain to max_stat
    let energy_gained = if (energy_gained_u64 > (gb.max_stat as u64)) {
        gb.max_stat
    } else {
        (energy_gained_u64 as u8)
    };
    pet.stats.energy = if (pet.stats.energy + energy_gained > gb.max_stat) gb.max_stat else pet.stats.energy + energy_gained;

    // Calculate happiness lost
    let happiness_lost_u64 = duration_ms / gb.sleep_happiness_loss_ms;
    let happiness_lost = if (happiness_lost_u64 > (gb.max_stat as u64)) {
        gb.max_stat
    } else {
        (happiness_lost_u64 as u8)
    };
    pet.stats.happiness = if (pet.stats.happiness > happiness_lost) pet.stats.happiness - happiness_lost else 0;

    // Calculate hunger lost
    let hunger_lost_u64 = duration_ms / gb.sleep_hunger_loss_ms;
    let hunger_lost = if (hunger_lost_u64 > (gb.max_stat as u64)) {
        gb.max_stat
    } else {
        (hunger_lost_u64 as u8)
    };
    pet.stats.hunger = if (pet.stats.hunger > hunger_lost) pet.stats.hunger - hunger_lost else 0;

    update_pet_image(pet);

    emit_action(pet, b"woke_up");
}


public entry fun check_and_level_up(pet: &mut Pet) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let gb = get_game_balance();

    // Calculate required exp: level * exp_per_level
    let required_exp = (pet.game_data.level as u64) * gb.exp_per_level;
    assert!(pet.game_data.experience >= required_exp, E_NOT_ENOUGH_EXP);

    // Level up
    pet.game_data.level = pet.game_data.level + 1;
    pet.game_data.experience = pet.game_data.experience - required_exp;

    // Update image based on level and equipped accessory
    update_pet_image(pet);

    emit_action(pet, b"leveled_up")
}

public entry fun mint_accessory(ctx: &mut TxContext) {
    let accessory = PetAccessory {
        id: object::new(ctx),
        name: string::utf8(b"cool glasses"),
        image_url: string::utf8(ACCESSORY_GLASSES_IMAGE_URL)
    };
    transfer::public_transfer(accessory, ctx.sender());
}

public entry fun equip_accessory(pet: &mut Pet, accessory: PetAccessory) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let key = string::utf8(EQUIPPED_ITEM_KEY);
    assert!(!dynamic_field::exists_<String>(&pet.id, copy key), E_ITEM_ALREADY_EQUIPPED);

    // Add accessory to pet
    dynamic_field::add(&mut pet.id, key, accessory);
    // Update image
    update_pet_image(pet);
    emit_action(pet, b"equipped_item");
}

public entry fun unequip_accessory(pet: &mut Pet, ctx: &mut TxContext) {
    assert!(!is_sleeping(pet), E_PET_IS_ASLEEP);

    let key = string::utf8(EQUIPPED_ITEM_KEY);
    assert!(dynamic_field::exists_<String>(&pet.id, key), E_NO_ITEM_EQUIPPED);

    // Remove accessory
    let accessory: PetAccessory = dynamic_field::remove<String, PetAccessory>(&mut pet.id, key);
    // Update image
    update_pet_image(pet);

    transfer::transfer(accessory, ctx.sender());
    emit_action(pet, b"unequipped_item");
}

// === Helper Functions ===
fun emit_action(pet: &Pet, action: vector<u8>) {
    event::emit(PetAction {
        pet_id: object::id(pet),
        action: string::utf8(action),
        energy: pet.stats.energy,
        happiness: pet.stats.happiness,
        hunger: pet.stats.hunger,
    });
}

fun update_pet_image(pet: &mut Pet) {
    let key = string::utf8(EQUIPPED_ITEM_KEY);
    let has_accessory = dynamic_field::exists_<String>(&pet.id, key);

    if (pet.game_data.level == 1) {
        if (has_accessory) {
            pet.image_url = string::utf8(PET_LEVEL_1_IMAGE_WITH_GLASSES_URL);
        } else {
            pet.image_url = string::utf8(PET_LEVEL_1_IMAGE_URL);
        }
    } else if (pet.game_data.level == 2) {
        if (has_accessory) {
            pet.image_url = string::utf8(PET_LEVEL_2_IMAGE_WITH_GLASSES_URL);
        } else {
            pet.image_url = string::utf8(PET_LEVEL_2_IMAGE_URL);
        }
    } else if (pet.game_data.level >= 3) {
        if (has_accessory) {
            pet.image_url = string::utf8(PET_LEVEL_3_IMAGE_WITH_GLASSES_URL);
        } else {
            pet.image_url = string::utf8(PET_LEVEL_3_IMAGE_URL);
        }
    };
}

// === View Functions ===
public fun get_pet_name(pet: &Pet): String { pet.name }
public fun get_pet_adopted_at(pet: &Pet): u64 { pet.adopted_at }
public fun get_pet_coins(pet: &Pet): u64 { pet.game_data.coins }
public fun get_pet_experience(pet: &Pet): u64 { pet.game_data.experience }
public fun get_pet_level(pet: &Pet): u8 { pet.game_data.level }
public fun get_pet_energy(pet: &Pet): u8 { pet.stats.energy }
public fun get_pet_hunger(pet: &Pet): u8 { pet.stats.hunger }
public fun get_pet_happiness(pet: &Pet): u8 { pet.stats.happiness }

public fun get_pet_stats(pet: &Pet): (u8, u8, u8) {
    (pet.stats.energy, pet.stats.hunger, pet.stats.happiness)
}
public fun get_pet_game_data(pet: &Pet): (u64, u64, u8) {
    (pet.game_data.coins, pet.game_data.experience, pet.game_data.level)
}

public fun is_sleeping(pet: &Pet): bool {
    let key = string::utf8(SLEEP_STARTED_AT_KEY);
    dynamic_field::exists_<String>(&pet.id, key)
}

// === Test-Only Functions ===
#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(TAMAGOSUI {}, ctx);
}
```

## Step 17: Deploy dan Testing

### Compile Contract:

```bash
sui move build
```

### Deploy ke Testnet:

```bash
sui client publish
```

### Test Functions:

```bash
# Adopt pet
sui client call --function adopt_pet --module tamagosui --package [PACKAGE_ID] --args "My Pet" [CLOCK_ID]

# Feed pet
sui client call --function feed_pet --module tamagosui --package [PACKAGE_ID] --args [PET_ID]
```

# 🧠 Konsep Move Lanjutan dalam Tamagosui

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
>
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
>
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
>
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
>
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
>
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
>
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

**3. Operasi Batch (Next Update):**

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
>
> - [Sui Gas Pricing](https://docs.sui.io/concepts/sui-move-concepts#entry-functions)

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

**Pertanyaan untuk Eksplorasi:**

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
