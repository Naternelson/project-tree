# Project Summary Generator Script

This JavaScript Project is a script that generates a summary of a project's structure and saves it as a JSON file. Below is a breakdown of the functions within the script and their purposes.

## Functions

### `readIgnoreFile(projectRoot)`
Reads the `.projectignore` or `.gitignore` file in the project root directory and returns an array of the ignore patterns. If no ignore file is found, it returns an empty array.

### `shouldIgnore(filePath, ignorePatterns, projectRoot)`
Checks if a given file or directory should be ignored based on the ignore patterns. It always ignores `.metadata` files.

### `getFileDetails(filePath)`
Gets the details of a file. If a `.metadata` file exists for the given file, it reads the metadata content and returns an object with the file name and metadata content. If no `.metadata` file exists, it simply returns the file name.

### `constructDirectoryObject(dirPath, ignorePatterns, projectRoot)`
Constructs a JavaScript object representing the directory structure of the given directory path. It recursively calls itself for subdirectories. It uses `shouldIgnore` to ignore certain files and directories, and `getFileDetails` to get the details of each file.

### `generateProjectSummary(projectRoot, ignorePatterns)`
Generates a summary of the project. It reads and parses the `package.json` file, generates the directory structure using `constructDirectoryObject`, and combines the `package.json` information and directory structure into a summary object. It then writes this summary object to a `projectSummary.json` file in the project root directory.

## Usage

The script is run from the command line and takes the project root directory as an argument. If no argument is provided, it uses the current working directory. The script performs the following actions:

1. Reads the ignore file.
2. Generates the project summary.
3. Writes the summary to a file.

## Requirements

To use this script, ensure you have Node.js installed on your system. Place the script in your project root or specify the project root directory as an argument when running the script from the command line.
