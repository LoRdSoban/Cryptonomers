
;; digital_will


;; errors
;;

(define-constant WILL_ALREADY_EXISTS (err u100))
(define-constant WILL_DOESNT_EXISTS (err u101))
(define-constant NOT_LICENSED_ENTITY (err u102))

(define-constant licensed 'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6)
;; data maps and vars
;;

(define-non-fungible-token will_nft uint)

(define-map will_owners { owner: principal } { will-id: uint } )
(define-map will_info {will-id: uint } {beneficiary: principal, amount: uint} )


(define-data-var last_will_id uint u0)

;; private functions
;;

(define-private (does_will_exists (owner principal)) 

   (if (is-eq (is-some (map-get? will_owners {owner: owner})) true)
   
    ;; TRUE
    true

    ;; FALSE
    false
   
   )
)

(define-private (will_amount_transfer (sender principal) (recipient principal) (amount uint))

    (stx-transfer? amount sender recipient)

)

;; public functions
;;

(define-public (mint_will (beneficiary principal) (amount uint) )  

(begin

;; makes sure the tx-sender doesn't have a will beforehand
(asserts! (is-eq (does_will_exists tx-sender) false) WILL_ALREADY_EXISTS)

(let 

    (
        (current_will_id (+ (var-get last_will_id) u1) )
    ) 

    (try! (nft-mint? will_nft current_will_id tx-sender))

    (map-set will_owners {owner: tx-sender} {will-id: current_will_id})

    (map-set will_info {will-id: current_will_id} {beneficiary: beneficiary, amount: amount} )

    (try! (will_amount_transfer tx-sender licensed amount))
    
)


(ok true)

)
)

(define-public (burn_will (owner principal))

(begin

;; makes sure the tx-sender have a will beforehand
(asserts! (is-eq (does_will_exists owner) true) WILL_DOESNT_EXISTS)

(let 

    (
        (will_id (get will-id (unwrap-panic (map-get? will_owners {owner: owner}))))

        ;; retreives info about the will
        (beneficiary (get beneficiary (unwrap-panic (map-get? will_info {will-id: will_id}))))
        (amount (get amount (unwrap-panic (map-get? will_info {will-id: will_id}))))
    ) 

    ;; makes sure the tx-sender is same as licensed entity
    (asserts! (is-eq licensed tx-sender) NOT_LICENSED_ENTITY)

    (try! (will_amount_transfer tx-sender beneficiary amount))
    (try! (nft-burn? will_nft will_id owner))
    
    
)

(ok true)

)
)


;; read only functions
;;

(define-read-only (get_will_id (owner principal)) 

(default-to u0 (get will-id (map-get? will_owners {owner: owner})))

)

(define-read-only (get_will_owner (will_id uint))

    (ok (unwrap! (nft-get-owner? will_nft will_id) WILL_DOESNT_EXISTS))
)

(define-read-only (get_will_beneficiary (will_id uint)) 

(begin

    ;; makes sure the tx-sender is same as licensed entity
    (asserts! (is-eq licensed tx-sender) NOT_LICENSED_ENTITY)

    (ok (get beneficiary (unwrap! (map-get? will_info {will-id: will_id}) WILL_DOESNT_EXISTS) ))
)
)

(define-read-only (get_will_amount (will_id uint)) 

(begin

    ;; makes sure the tx-sender is same as licensed entity
    (asserts! (is-eq licensed tx-sender) NOT_LICENSED_ENTITY)

    (ok (get amount (unwrap! (map-get? will_info {will-id: will_id}) WILL_DOESNT_EXISTS)) )
)
)