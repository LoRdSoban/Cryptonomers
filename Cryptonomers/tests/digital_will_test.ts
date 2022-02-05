
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Testing the whole contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        let deployer = accounts.get('deployer')!;
        let licensed = accounts.get('wallet_9')!;

        let wallet1 = accounts.get('wallet_1')!; // owner
        let wallet2 = accounts.get('wallet_2')!; // beneficiary

        let wallet3 = accounts.get('wallet_3')!; // owner
        let wallet4 = accounts.get('wallet_4')!; // beneficiary



        let block = chain.mineBlock([
            
            Tx.contractCall('digital_will', 'mint_will', [types.principal(wallet2.address), types.uint(100)], wallet1.address),
            Tx.contractCall('digital_will', 'mint_will', [types.principal(wallet2.address), types.uint(100)], wallet1.address),

            Tx.contractCall('digital_will', 'mint_will', [types.principal(wallet4.address), types.uint(1000)], wallet3.address),



        ]);
        assertEquals(block.receipts.length, 3);
        assertEquals(block.height, 2);


        block.receipts[0].result.expectOk().expectBool(true);
        // checks if stx are transferred to licensed entity from owner of will upon minting the NFT
        block.receipts[0].events.expectSTXTransferEvent(100, wallet1.address, licensed.address );

        block.receipts[1].result.expectErr().expectUint(100);

        block.receipts[2].result.expectOk().expectBool(true);

        // The principal used to call the function is not licensed
        let error_beneficiary_address = chain.callReadOnlyFn('digital_will', 'get_will_beneficiary', [types.uint(1)], wallet1.address)
        error_beneficiary_address.result.expectErr().expectUint(102);

        // The principal used to call the function is licensed
        let correct_beneficiary_address = chain.callReadOnlyFn('digital_will', 'get_will_beneficiary', [types.uint(1)], licensed.address)
        correct_beneficiary_address.result.expectOk().expectPrincipal(wallet2.address);

        // The function should return u1, which is the id of nft because only one nft is minted write now.
        let correct_will_id = chain.callReadOnlyFn('digital_will', 'get_will_id', [types.principal(wallet1.address)], licensed.address)
        correct_will_id.result.expectUint(1);

        // There is not will for the principal passed
        let wrong_will_id = chain.callReadOnlyFn('digital_will', 'get_will_id', [types.principal(wallet2.address)], licensed.address)
        wrong_will_id.result.expectUint(0);

        let second_will_id = chain.callReadOnlyFn('digital_will', 'get_will_id', [types.principal(wallet3.address)], licensed.address)
        second_will_id.result.expectUint(2);

        block = chain.mineBlock([

            // calling using not licensed principal
            Tx.contractCall('digital_will', 'burn_will', [types.principal(wallet1.address)], wallet2.address),
            
            // calling using the licensed principal
            Tx.contractCall('digital_will', 'burn_will', [types.principal(wallet1.address)], licensed.address),


        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 3);

        block.receipts[0].result.expectErr().expectUint(102);


        block.receipts[1].result.expectOk().expectBool(true);

        // checks if stx are transferred to beneficiary from licensed entity upon burning the NFT
        block.receipts[1].events.expectSTXTransferEvent(100, licensed.address, wallet2.address );

        

    },
});
