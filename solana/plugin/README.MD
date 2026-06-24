# AsyncPlugin
Reference Implementation of the Solana Validators's [Geyser Plugin](https://github.com/anza-xyz/agave/tree/master/geyser-plugin-interface) for asyncronous processing of account updates and transactions.

The Validator's callback methods are concurrently sending messages to a channel that is being drained by a single [Procesor](src/processor.rs) in it's own thread. This approach makes message processing thread safe and also decouples it from Validator, which in turn simplifies the Processor's testing and reusability.

### Build and Run on Localnet
1. [Set up the Solana dev environment](https://anza.xyz/developers/guides/getstarted/setup-local-development)
1. Obtain source code:
   1. `mkdir -p ~/work/src/`
   1. `cd ~/work/src`
   1. `git clone git@github.com:andreimontchik/public.git`
   1. `cd public/solana/plugin`
1. Build the plugin: `cargo build`
1. Create the plugin config. Use [plugin.localnet.json](config/plugin.localnet.json) as reference. 
1. Run on the Localnet:
   1. `mkdir -p ~/work`
   1. `cd ~/work`
   1. `export RUST_LOG=solana=info,async_plugin=info; rm -f test-ledger/validator.log;  solana-test-validator --geyser-plugin-config ~/work/src/public/solana/plugin/config/plugin.localnet.json`
