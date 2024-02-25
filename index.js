#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const minimatch = require('minimatch').minimatch;

function readIgnoreFile(projectRoot) {
	const ignoreFilePath = path.join(projectRoot, '.projectignore');
	try {
		// Check for .projectignore file
		if (fs.existsSync(ignoreFilePath)) {
			// Use split to handle both Windows (\r\n) and UNIX (\n) line endings
			// Trim each line to remove potential trailing carriage return characters
			return fs
				.readFileSync(ignoreFilePath, 'utf8')
				.split(/\r?\n/)
				.filter(Boolean)
				.map((line) => line.trim());
		} else {
			const gitIgnoreFilePath = path.join(projectRoot, '.gitignore');
			// Check for .gitignore file
			if (fs.existsSync(gitIgnoreFilePath)) {
				// Use split to handle both Windows (\r\n) and UNIX (\n) line endings
				// Trim each line to remove potential trailing carriage return characters
				return fs
					.readFileSync(gitIgnoreFilePath, 'utf8')
					.split(/\r?\n/)
					.filter(Boolean)
					.map((line) => line.trim());
			}
		}
	} catch (e) {
		return []; // No ignore file found
	}
	return []; // No ignore file found
}

function shouldIgnore(filePath, ignorePatterns, projectRoot) {
	let relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
	// Append a slash to directory paths to improve matching accuracy
	if (fs.statSync(filePath).isDirectory() && !relativePath.endsWith('/')) {
		relativePath += '/';
	}

	// Check if the file is a .metadata file
	if (path.extname(filePath) === '.metadata') return true; // Always ignore .metadata files

	const shouldIgnore = ignorePatterns.some((pattern) => {
		const options = { dot: true, matchBase: false }; // Always consider the full path
		return minimatch(relativePath, pattern, options);
	});
	return shouldIgnore;
}

function getFileDetails(filePath) {
	const fileName = path.basename(filePath, path.extname(filePath));
	const metadataPath = `${filePath}.metadata`;

	// Check for and read corresponding .metadata file
	if (fs.existsSync(metadataPath)) {
		const metadataContent = fs.readFileSync(metadataPath, 'utf8');
		return { name: fileName, summary: metadataContent };
	}
	return fileName;
}

function constructDirectoryObject(dirPath, ignorePatterns, projectRoot) {
	let structure = {};
	const items = fs.readdirSync(dirPath);

	items.forEach((item) => {
		let fullPath = path.join(dirPath, item);
		if (!shouldIgnore(fullPath, ignorePatterns, projectRoot)) {
			if (fs.statSync(fullPath).isDirectory()) {
				structure[item] = constructDirectoryObject(fullPath, ignorePatterns, projectRoot); // Recursively construct structure
			} else {
				// Include more file details
				structure[item] = getFileDetails(fullPath);
			}
		}
	});

	return structure;
}

function generateProjectSummary(projectRoot, ignorePatterns) {
	// Read package.json and parse its content
	const packageJsonPath = path.join(projectRoot, 'package.json');
	let packageJson = {};
	try {
		packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	} catch (e) {
		console.log('No package.json found or failed to parse package.json:', e);
	}

	// Generate directory structure
	const projectStructure = constructDirectoryObject(projectRoot, ignorePatterns, projectRoot);

	// Combine package.json information and directory structure
	const summary = {
		project: packageJson,
		structure: projectStructure,
	};

	// Write summary to file
	fs.writeFileSync(path.join(projectRoot, 'projectSummary.json'), JSON.stringify(summary, null, 2));
	console.log('Project summary has been generated.');
}

const projectRoot = process.argv[2] || process.cwd(); // Use current working directory
const ignorePatterns = readIgnoreFile(projectRoot);
generateProjectSummary(projectRoot, ignorePatterns, projectRoot);
