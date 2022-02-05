
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Testing the whole contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        let deployer = accounts.get('deployer')!;
        let licensed = accounts.get('wallet_9')!;

        let wallet1 = accounts.get('wallet_1')!;
        let wallet2 = accounts.get('wallet_2')!;

        let block = chain.mineBlock([
            
            Tx.contractCall('digital_will', 'mint_will', [types.principal(wallet2.address), types.uint(100)], wallet1.address),
            Tx.contractCall('digital_will', 'mint_will', [types.principal(wallet2.address), types.uint(100)], wallet1.address),

        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);


        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectErr().expectUint(100);

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

        // block = chain.mineBlock([
        //     /* 
        //      * Add transactions with: 
        //      * Tx.contractCall(...)
        //     */
        // ]);
        // assertEquals(block.receipts.length, 0);
        // assertEquals(block.height, 3);
    },
});
