# Digital Will

A smart contract written using [clarity language](https://clarity-lang.org/). It allows a user to mint a digital will as a NFT. The user can add a licensed entity and beneficiary entity. The **licensed entity** has the authority to burn the NFT (digital will) upon the death of original owner. Once the NFT (digital will) is burnt, the funds are transferred to the **beneficiary entity**  according to the will. 

---
## Public Functions

- mint_will (beneficiary **principal**) (amount **uint**) 

- burn_will (owner **principal**)

---

## Private Functions

- does_will_exists (owner **principal**)

- will_amount_transfer (sender **principal**) (recipient **principal**) (amount **uint**)

---


## Read Only Functions

-  get_will_id (owner **principal**)

- get_will_owner (will_id **uint**)

- get_will_beneficiary (will_id **uint**)

- get_will_amount (will_id **uint**)

---

**Developed by Soban Amir**

---
