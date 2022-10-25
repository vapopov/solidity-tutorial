
.PHONY: deploy-anvil
deploy-anvil:
	npx hardhat run scripts/token.ts --network anvil


.PHONY: test
test:
	npx hardhat test
