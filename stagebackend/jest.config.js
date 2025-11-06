module.exports = {
    testEnvironment: 'node', // Exécuter les tests dans l'environnement Node.js
    coverageDirectory: 'coverage', // Sauvegarder les rapports de couverture dans le dossier "coverage"
    collectCoverage: true, // Activer la collecte de la couverture
    collectCoverageFrom: ['src/**/*.{js,jsx}'], // Collecter la couverture uniquement pour les fichiers dans "src"
    testMatch: ['**/tests/**/*.test.js'], // Rechercher les tests dans le dossier "tests"
    testPathIgnorePatterns: ['/node_modules/', '/coverage/'], // Ignorer les dossiers inutiles
    coverageReporters: ['text', 'lcov', 'html'], // Générer des rapports de couverture dans différents formats
};
