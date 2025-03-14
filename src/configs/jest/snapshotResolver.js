/**
 * Custom snapshot resolver for jest.
 */
module.exports = {
  testPathForConsistencyCheck: 'some.test.js',
  resolveSnapshotPath: (testPath, snapshotExtension) => testPath + snapshotExtension,
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath.replace(snapshotExtension, ''),
};
