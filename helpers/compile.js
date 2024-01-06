/**
 * @dev Usage: deploy 'contractName' (without the extension, .json)
 * Deploys a contract by taking the .json file with the same name and
 * contains the abi and evm: 25 Jan 2023
 */
const path = require('path');
const fs = require('fs');

const build_path = path.resolve(process.cwd(), 'build');

const prompt = require('./prompt.js');

/**
 * Compiles individual files. Contains import callback 'findImports'
 * @param {String} contract_file 
 * @param {String} dir 
 * @returns 
 */
const compileContractFile = (contract_file, dir) => {
    try {
        const src = fs.readFileSync(path.resolve(process.cwd(), dir, `${contract_file}.sol`), 'utf-8');
        const with_imports = src.indexOf('import');

        const compile_options = {
            language: 'Solidity',
            sources: {},
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['*'],
                    },
                },
            },
        };

        // import provision: 20 Jan 2023
        // if (with_imports > 0) {
        //     const has_imports = (process.argv).indexOf('imports');
        //     if (has_imports > 2) {
        //         for (let i = has_imports + 1; i < (process.argv).length; i++) {
        //             const import_file = process.argv[i];
        //             let import_src = null
        //             try {
        //                 import_src = fs.readFileSync(path.resolve(process.cwd(), dir, `${import_file}.sol`), 'utf-8');
        //             } catch (err) {
        //                 // console.log(err.message);
        //                 import_src = fs.readFileSync(path.resolve(process.cwd(), dir, 'oz', `${import_file}.sol`), 'utf-8');
        //             }
        //             if (!import_src) throw new Error('Import source(s) NOT FOUND.');
        //             compile_options.sources[`${import_file}.sol`] = { content: import_src };
        //         }
        //         // console.log(Object.keys(compile_options.sources));
        //     }
        // }

        compile_options.sources[`${contract_file}.sol`] = { content: src };

        const solc = require('solc');
        // import callback 'findImports' superceded import provision from 20 Jan: 24 Jan 2023
        const output = JSON.parse(solc.compile(JSON.stringify(compile_options), { import: findImports }));

        /** The output contract object has the "contracts" mapping
         * based on the src file including the extension (.sol)
         */
        const contract_obj = output.contracts[`${contract_file}.sol`];
        // const contract_obj = output.contracts[`${contract_name}.sol`][contract_name];

        /** Writing json files per contract regardless of the
         * file where they are from.
         * Possible issue when contract names are in conflict
         */
        writeContractOutput(contract_obj);

        /** Return the contract_obj; just in case you want to
         * defer the writing (per file)
         * See line 84: 04 Jan 2022 
         * */
        return contract_obj;
    } catch (err) {
        console.log(`> ERR. ${err.message}`);
        return null;
    }
};

/**
 * Pulls the import file from a separate directory (from the src)
 * @param {String} path 
 */
const findImports = import_file => {
    if (import_file)
        return {
            contents: fs.readFileSync(path.resolve(process.cwd(), 'contracts', import_file), 'utf-8')
        };
    else return { error: 'File not found' };
};

/** Writes contract object to .json files
 * @param {Object} output the compiled contract output
 */
const writeContractOutput = output => {
    for (let contract in output) {
        fs.writeFileSync(`${build_path}/${contract}.json`, JSON.stringify(output[contract]), 'utf-8');
    }
};

/** Compiles contracts from single of multiple files depending on the passed arguments
 * @param {String} contract_files file name for single file without the extension (.sol)
 * @param {Array} contract_files file names for multiple files without the extension (.sol)
 */
function compileContractFiles(contract_files = [], contract_dir = 'contracts') {
    const contracts_obj = {};
    if (Array.isArray(contract_files)) {
        if (contract_files.indexOf('imports') > 0) {
            contracts_obj[contract_files[0]] = compileContractFile(contract_files[0], contract_dir);
        } else {
            contract_files.forEach(contract => {
                contracts_obj[contract] = compileContractFile(contract, contract_dir);
            });
        }
    } else {
        contracts_obj[contract_files] = compileContractFile(contract_files, contract_dir);
    }
    // Writing json files per contract file:
    // writeContractOutput(contracts_obj);
}

(async () => {
    const purge = await new Promise(resolve => {
        prompt('Would you like to purge /build ? ', async resp => {
            return (resolve(resp != 'n' ? true : false));
        });
    });

    if (process.argv.length == 2) {
        await new Promise(resolve => {
            prompt('What file(s) would you like to compile ? ', async resp => {
                if (Array.isArray(resp)) process.argv.push(...resp);
                else process.argv.push(resp);
                return (resolve());
            });
        });
    }

    if (purge) {
        console.log('> Purging /build');
        try {
            const files_arr = fs.readdirSync(build_path);
            if (files_arr || files_arr.length) {
                // purge
                fs.rmSync(`${process.cwd()}/build`, { recursive: true, force: true });
                // mkdir
                fs.mkdirSync(`${process.cwd()}/build`)
            }
        } catch (err) {
            fs.mkdirSync(`${process.cwd()}/build`)
        }
    }

    let src_dir = 'contracts';
    src_dir = await new Promise(resolve => {
        prompt('Please define the source directory ? ', async resp => {
            return (resolve(!resp ? 'contracts' : resp));
        });
    });

    console.log('> Compiling contents from /' + src_dir);

    if (process.argv.length > 3) {
        const contracts = [];
        process.argv.forEach((target_contract, i) => {
            if (i > 1) contracts.push(process.argv[i]);
        })
        console.log('> Compiling the ff contracts:');
        contracts.forEach(name => {
            console.log(`* ${name}`);
        })
        compileContractFiles(contracts, src_dir);
        console.log('> Finished.');
    } else if (process.argv.length == 3 && process.argv[2] != '') {
        console.log(`> Compiling ${process.argv[2]}.sol`);
        compileContractFiles(process.argv[2], src_dir);
    }
})();


// module.exports = compileContractFiles;