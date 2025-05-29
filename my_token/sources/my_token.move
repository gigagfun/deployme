module my_token::my_token {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    const DECIMALS: u8 = 9;

    // One-time witness struct
    public struct MY_TOKEN has drop {}

    // Module initialization
    fun init(witness: MY_TOKEN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            DECIMALS,
            b"MyToken",
            b"MTK",
            b"",
            option::none(),
            ctx
        );
        // Treasury cap ve metadata'yı modül sahibine transfer et
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
        transfer::public_transfer(metadata, tx_context::sender(ctx));
    }

    // Mint fonksiyonu
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<MY_TOKEN>,
        recipient: address,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }
}