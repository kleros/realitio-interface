# realitio-interface

  * realitio-interface: Reality Evidence Display, passing params in url.
  * reality-eth-lib: Fork from [reality](https://github.com/RealityETH/reality-eth-monorepo/) to display markdown. Useful functions for creating and interpreting questions and templates used by the reality.eth system.


Some packages reference each other, for example `realitio-interface` needs `reality-eth-lib`. When developing it can be useful to make your local environment refer directly to the working versions of the other packages in the repo. To do this, instead of running the normal `npm install` for each JavaScript package, run `lerna bootstrap --hoist` from the uppermost directory. This will install external dependencies normally, but set up dependencies within this repo as symlinks.
