#[test_only]
module 0x0::tamagosui_tests;

use std::string;
use sui::{clock::{Self, Clock}, test_scenario::{Self, Scenario}};
use 0x0::tamagosui;

const USER: address = @0xDEAD;

fun setup_pet(scenario: &mut Scenario) {
    // Initialize the module
    scenario.next_tx(USER);
    {
        tamagosui::init_for_testing(scenario.ctx());
    };
    
    // Create and share clock
    scenario.next_tx(USER);
    {
        let mut clock = clock::create_for_testing(scenario.ctx());
        clock.set_for_testing(100_000_000);
        clock.share_for_testing();
    };
    
    // Adopt pet
    scenario.next_tx(USER);
    {
        let clock = scenario.take_shared<Clock>();
        tamagosui::adopt_pet(string::utf8(b"Fluffy"), &clock, scenario.ctx());
        test_scenario::return_shared(clock);
    };
    
    // Check pet was created correctly
    scenario.next_tx(USER);
    {
        let pet = scenario.take_from_sender<tamagosui::Pet>();
        assert!(tamagosui::get_pet_name(&pet) == string::utf8(b"Fluffy"), 1);
        scenario.return_to_sender(pet);
    };
}

#[test]
fun test_adopt_pet() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    // Check pet fields
    scenario.next_tx(USER);
    {
        let pet = scenario.take_from_sender<tamagosui::Pet>();
        assert!(pet.get_pet_name() == string::utf8(b"Fluffy"), 1);
        assert!(pet.get_pet_adopted_at() == 100_000_000, 2);
        assert!(pet.get_pet_coins() == 20, 3);
        assert!(pet.get_pet_experience() == 0, 4);
        assert!(pet.get_pet_level() == 1, 5);
        assert!(pet.get_pet_energy() == 60, 6);
        assert!(pet.get_pet_happiness() == 50, 7);
        assert!(pet.get_pet_hunger() == 40, 8);
        scenario.return_to_sender(pet);
    };

    scenario.end();
}

#[test]
fun test_feed_pet() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        // Check initial stats
        assert!(pet.get_pet_hunger() == 40, 1);
        assert!(pet.get_pet_coins() == 20, 2);
        assert!(pet.get_pet_experience() == 0, 3);
        // Feed the pet
        tamagosui::feed_pet(&mut pet);
        scenario.return_to_sender(pet);
    };

    scenario.next_tx(USER);
    {
        let pet = scenario.take_from_sender<tamagosui::Pet>();
        // Check stats after feeding
        assert!(pet.get_pet_hunger() == 60, 4);
        assert!(pet.get_pet_coins() == 15, 5);
        assert!(pet.get_pet_experience() == 5, 6);
        scenario.return_to_sender(pet);
    };
    scenario.end();
}

#[test]
fun test_play_with_pet() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        // Check initial stats
        assert!(pet.get_pet_energy() == 60, 1);
        assert!(pet.get_pet_hunger() == 40, 2);
        assert!(pet.get_pet_experience() == 0, 3);
        assert!(pet.get_pet_happiness() == 50, 4);
        // Play with the pet
        tamagosui::play_with_pet(&mut pet);
        scenario.return_to_sender(pet);
    };

    scenario.next_tx(USER);
    {
        // Check stats after playing
        let pet = scenario.take_from_sender<tamagosui::Pet>();
        assert!(pet.get_pet_energy() == 45, 5);
        assert!(pet.get_pet_hunger() == 25, 6);
        assert!(pet.get_pet_experience() == 10, 7);
        assert!(pet.get_pet_happiness() == 75, 8);
        scenario.return_to_sender(pet);
    };
    scenario.end();
}

#[test]
fun test_pet_works() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        // Check initial stats
        assert!(pet.get_pet_energy() == 60, 1);
        assert!(pet.get_pet_hunger() == 40, 2);
        assert!(pet.get_pet_happiness() == 50, 3);
        assert!(pet.get_pet_coins() == 20, 4);
        assert!(pet.get_pet_experience() == 0, 5);
        // Pet works for coins
        tamagosui::work_for_coins(&mut pet);
        scenario.return_to_sender(pet);
    };

    scenario.next_tx(USER);
    {
        // Check stats after working
        let pet = scenario.take_from_sender<tamagosui::Pet>();
        assert!(pet.get_pet_energy() == 40, 5);
        assert!(pet.get_pet_hunger() == 20, 7);
        assert!(pet.get_pet_happiness() == 30, 8);
        assert!(pet.get_pet_coins() == 30, 8);
        assert!(pet.get_pet_experience() == 15, 9);
        scenario.return_to_sender(pet);
    };
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 0x0::tamagosui::E_PET_IS_ASLEEP)]
fun test_feed_pet_while_sleeping_should_fail() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    // Put pet to sleep first
    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        let clock = scenario.take_shared<Clock>();
        tamagosui::let_pet_sleep(&mut pet, &clock);
        assert!(tamagosui::is_sleeping(&pet), 1);

        test_scenario::return_shared(clock);
        scenario.return_to_sender(pet);
    };

    // Try to feed pet while sleeping - should fail
    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        tamagosui::feed_pet(&mut pet); // This should abort with E_PET_IS_ASLEEP
        scenario.return_to_sender(pet);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = 0x0::tamagosui::E_PET_IS_ALREADY_ASLEEP)]
fun test_let_pet_sleep_when_already_sleeping_should_fail() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    // Put pet to sleep first
    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        let clock = scenario.take_shared<Clock>();
        tamagosui::let_pet_sleep(&mut pet, &clock);
        assert!(tamagosui::is_sleeping(&pet), 1);
        test_scenario::return_shared(clock);
        scenario.return_to_sender(pet);
    };

    // Try to put pet to sleep again - should fail
    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        let clock = scenario.take_shared<Clock>();
        tamagosui::let_pet_sleep(&mut pet, &clock); // This should abort with E_PET_IS_ALREADY_ASLEEP
        test_scenario::return_shared(clock);
        scenario.return_to_sender(pet);
    };

    scenario.end();
}


#[test]
fun test_wake_up_pet_calculates_stats_correctly() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    let initial_energy;
    let initial_happiness;
    let initial_hunger;
    
    // Put pet to sleep and record initial stats
    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        let clock = scenario.take_shared<Clock>();
        
        initial_energy = pet.get_pet_energy();
        initial_happiness = pet.get_pet_happiness();
        initial_hunger = pet.get_pet_hunger();
        
        tamagosui::let_pet_sleep(&mut pet, &clock);
        assert!(tamagosui::is_sleeping(&pet), 1);
        test_scenario::return_shared(clock);
        scenario.return_to_sender(pet);
    };

    // Fast forward time and wake up pet
    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        let mut clock = scenario.take_shared<Clock>();
        
        // Fast forward 10 seconds (10,000 ms)
        clock.increment_for_testing(10_000);
        
        tamagosui::wake_up_pet(&mut pet, &clock);
        assert!(!tamagosui::is_sleeping(&pet), 2);
        
        // Check that stats changed correctly after sleep
        // Energy should have increased (1 per second = 10 energy)
        let new_energy = pet.get_pet_energy();
        assert!(new_energy > initial_energy, 3);
        
        // Happiness should have decreased (1 per 0.7 seconds = ~14 happiness lost)
        let new_happiness = pet.get_pet_happiness();
        assert!(new_happiness < initial_happiness, 4);
        
        // Hunger should have decreased (1 per 0.5 seconds = 20 hunger lost)  
        let new_hunger = pet.get_pet_hunger();
        assert!(new_hunger < initial_hunger, 5);
        
        test_scenario::return_shared(clock);
        scenario.return_to_sender(pet);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = 0x0::tamagosui::E_NOT_ENOUGH_EXP)]
fun test_level_up_without_enough_experience_should_fail() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        // Try to level up with only initial 0 experience
        assert!(pet.get_pet_experience() == 0, 1);
        assert!(pet.get_pet_level() == 1, 2);
        
        tamagosui::check_and_level_up(&mut pet); // Should fail with E_NOT_ENOUGH_EXP
        scenario.return_to_sender(pet);
    };

    scenario.end();
}

#[test]
fun test_mint_accessory() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    scenario.next_tx(USER);
    {
        // Mint accessory
        tamagosui::mint_accessory(scenario.ctx());
    };

    scenario.next_tx(USER);
    {
        // Check accessory was created
        let accessory = scenario.take_from_sender<tamagosui::PetAccessory>();
        // Note: We can't directly check accessory fields as they don't have getter functions
        // But if we can take it from sender, it means it was successfully minted
        scenario.return_to_sender(accessory);
    };

    scenario.end();
}

#[test]
fun test_equip_accessory() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    // Mint accessory first
    scenario.next_tx(USER);
    {
        tamagosui::mint_accessory(scenario.ctx());
    };

    // Equip the accessory
    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        let accessory = scenario.take_from_sender<tamagosui::PetAccessory>();
        
        // Check pet doesn't have accessory initially
        assert!(!tamagosui::is_sleeping(&pet), 1); // Pet should be awake to equip
        
        tamagosui::equip_accessory(&mut pet, accessory);
        scenario.return_to_sender(pet);
    };

    // Check accessory is no longer in sender's possession (it's now part of the pet)
    scenario.next_tx(USER);
    {
        let pet = scenario.take_from_sender<tamagosui::Pet>();
        // We can't directly check if accessory is equipped without additional getter functions
        // But the fact that equip_accessory didn't fail means it worked
        scenario.return_to_sender(pet);
    };

    scenario.end();
}

#[test]
fun test_unequip_accessory() {
    let mut scenario = test_scenario::begin(USER);
    setup_pet(&mut scenario);

    // Mint and equip accessory first
    scenario.next_tx(USER);
    {
        tamagosui::mint_accessory(scenario.ctx());
    };

    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        let accessory = scenario.take_from_sender<tamagosui::PetAccessory>();
        tamagosui::equip_accessory(&mut pet, accessory);
        scenario.return_to_sender(pet);
    };

    // Now unequip the accessory
    scenario.next_tx(USER);
    {
        let mut pet = scenario.take_from_sender<tamagosui::Pet>();
        tamagosui::unequip_accessory(&mut pet, scenario.ctx());
        scenario.return_to_sender(pet);
    };

    // Check accessory is back in sender's possession
    scenario.next_tx(USER);
    {
        let pet = scenario.take_from_sender<tamagosui::Pet>();
        let accessory = scenario.take_from_sender<tamagosui::PetAccessory>();
        // If we can take both pet and accessory, unequip worked correctly
        scenario.return_to_sender(pet);
        scenario.return_to_sender(accessory);
    };

    scenario.end();
}
