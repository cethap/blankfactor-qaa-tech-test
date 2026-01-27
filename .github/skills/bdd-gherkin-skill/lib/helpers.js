/**
 * BDD Gherkin Helpers
 * Template generators and utilities for Gherkin/Cucumber BDD
 */

/**
 * Generate a feature file template
 * @param {Object} options - Feature options
 * @param {string} options.name - Feature name
 * @param {string} options.role - User role (As a...)
 * @param {string} options.goal - User goal (I want to...)
 * @param {string} options.benefit - Business benefit (So that...)
 * @param {string[]} options.tags - Feature tags
 */
function generateFeatureTemplate(options) {
  const {
    name,
    role = '[role]',
    goal = '[goal]',
    benefit = '[benefit]',
    tags = []
  } = options;

  const tagLine = tags.length > 0 ? tags.map(t => `@${t}`).join(' ') + '\n' : '';
  const title = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return `${tagLine}Feature: ${title}
  As a ${role}
  I want to ${goal}
  So that ${benefit}

  Background:
    Given I am on the application

  Scenario: [Describe the scenario]
    Given [precondition]
    When [action]
    Then [expected outcome]
`;
}

/**
 * Generate a scenario template
 * @param {Object} options - Scenario options
 * @param {string} options.title - Scenario title
 * @param {string[]} options.tags - Scenario tags
 * @param {Object[]} options.steps - Array of {keyword, text} objects
 */
function generateScenarioTemplate(options) {
  const { title, tags = [], steps = [] } = options;

  const tagLine = tags.length > 0 ? '  ' + tags.map(t => `@${t}`).join(' ') + '\n' : '';

  const defaultSteps = steps.length > 0 ? steps : [
    { keyword: 'Given', text: '[precondition]' },
    { keyword: 'When', text: '[action]' },
    { keyword: 'Then', text: '[expected outcome]' }
  ];

  const stepsText = defaultSteps
    .map(s => `    ${s.keyword} ${s.text}`)
    .join('\n');

  return `${tagLine}  Scenario: ${title}
${stepsText}
`;
}

/**
 * Generate a scenario outline template
 * @param {Object} options - Scenario outline options
 * @param {string} options.title - Scenario title
 * @param {string[]} options.tags - Scenario tags
 * @param {string[]} options.parameters - Parameter names for examples
 * @param {Object[]} options.examples - Array of example data objects
 */
function generateScenarioOutlineTemplate(options) {
  const {
    title,
    tags = [],
    parameters = ['input', 'expected'],
    examples = []
  } = options;

  const tagLine = tags.length > 0 ? '  ' + tags.map(t => `@${t}`).join(' ') + '\n' : '';

  // Generate parameter placeholders in steps
  const paramPlaceholders = parameters.map(p => `<${p}>`);

  // Default examples if none provided
  const exampleData = examples.length > 0 ? examples : [
    Object.fromEntries(parameters.map(p => [p, `value1`])),
    Object.fromEntries(parameters.map(p => [p, `value2`])),
  ];

  // Build examples table
  const header = '    | ' + parameters.join(' | ') + ' |';
  const rows = exampleData.map(row =>
    '    | ' + parameters.map(p => row[p] || '').join(' | ') + ' |'
  );

  return `${tagLine}  Scenario Outline: ${title}
    Given [precondition with ${paramPlaceholders[0] || '<param>'}]
    When [action]
    Then [outcome should be ${paramPlaceholders[1] || '<expected>'}]

    Examples:
${header}
${rows.join('\n')}
`;
}

/**
 * Generate a data table
 * @param {Object[]} data - Array of objects with same keys
 * @param {number} padding - Column padding (default 1)
 */
function generateDataTable(data, padding = 1) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);

  // Calculate column widths
  const widths = headers.map(h => {
    const values = data.map(row => String(row[h] || ''));
    return Math.max(h.length, ...values.map(v => v.length));
  });

  // Generate rows
  const pad = (str, width) => str.padEnd(width);
  const formatRow = (values) =>
    '| ' + values.map((v, i) => pad(String(v), widths[i])).join(' | ') + ' |';

  const headerRow = formatRow(headers);
  const dataRows = data.map(row => formatRow(headers.map(h => row[h] || '')));

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Generate a doc string
 * @param {string} content - Content of the doc string
 * @param {string} contentType - Optional content type (json, xml, etc.)
 */
function generateDocString(content, contentType = '') {
  const delimiter = '"""';
  const typeHint = contentType ? contentType : '';
  return `${delimiter}${typeHint}\n${content}\n${delimiter}`;
}

/**
 * Generate a Rule block
 * @param {Object} options - Rule options
 * @param {string} options.description - Rule description
 * @param {string[]} options.scenarios - Array of scenario templates
 */
function generateRuleTemplate(options) {
  const { description, scenarios = [] } = options;

  const scenariosText = scenarios.length > 0
    ? scenarios.join('\n\n')
    : `    Scenario: [Scenario under this rule]
      Given [precondition]
      When [action]
      Then [expected outcome]`;

  return `  Rule: ${description}

${scenariosText}
`;
}

/**
 * Generate a Background block
 * @param {Object[]} steps - Array of {keyword, text} objects
 */
function generateBackgroundTemplate(steps = []) {
  const defaultSteps = steps.length > 0 ? steps : [
    { keyword: 'Given', text: '[common precondition]' }
  ];

  const stepsText = defaultSteps
    .map(s => `    ${s.keyword} ${s.text}`)
    .join('\n');

  return `  Background:
${stepsText}
`;
}

/**
 * Generate step definition template
 * @param {Object} options - Step options
 * @param {string} options.keyword - Given/When/Then
 * @param {string} options.pattern - Step pattern with parameters
 * @param {string} options.implementation - Implementation code
 */
function generateStepDefinitionTemplate(options) {
  const { keyword, pattern, implementation = '// TODO: implement' } = options;

  // Detect parameters in pattern
  const stringParams = (pattern.match(/\{string\}/g) || []).length;
  const intParams = (pattern.match(/\{int\}/g) || []).length;

  const params = [];
  for (let i = 0; i < stringParams; i++) params.push(`str${i + 1}: string`);
  for (let i = 0; i < intParams; i++) params.push(`num${i + 1}: number`);

  const paramList = params.join(', ');

  return `${keyword}('${pattern}', async function (this: CustomWorld${paramList ? ', ' + paramList : ''}) {
  ${implementation}
});
`;
}

/**
 * Parse Gherkin step to extract parameters
 * @param {string} step - Gherkin step text
 */
function parseStepParameters(step) {
  const stringMatches = step.match(/"([^"]*)"/g) || [];
  const numberMatches = step.match(/\b\d+(\.\d+)?\b/g) || [];

  return {
    strings: stringMatches.map(s => s.replace(/"/g, '')),
    numbers: numberMatches.map(n => parseFloat(n)),
    hasDataTable: false,
    hasDocString: false,
  };
}

/**
 * Convert step text to Cucumber expression pattern
 * @param {string} step - Gherkin step text
 */
function stepToCucumberExpression(step) {
  return step
    .replace(/"[^"]*"/g, '{string}')
    .replace(/\b\d+\b/g, '{int}')
    .replace(/\b\d+\.\d+\b/g, '{float}');
}

/**
 * Validate feature file structure
 * @param {string} content - Feature file content
 */
function validateFeatureStructure(content) {
  const issues = [];
  const lines = content.split('\n');

  let hasFeature = false;
  let hasScenario = false;
  let inScenario = false;
  let hasGiven = false;
  let hasThen = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('Feature:')) hasFeature = true;
    if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
      if (inScenario && !hasThen) {
        issues.push({ line: i, message: 'Previous scenario has no Then step' });
      }
      hasScenario = true;
      inScenario = true;
      hasGiven = false;
      hasThen = false;
    }
    if (line.startsWith('Given ')) hasGiven = true;
    if (line.startsWith('Then ')) hasThen = true;
  }

  if (!hasFeature) issues.push({ line: 1, message: 'Missing Feature keyword' });
  if (!hasScenario) issues.push({ line: 1, message: 'No scenarios defined' });
  if (inScenario && !hasThen) {
    issues.push({ line: lines.length, message: 'Last scenario has no Then step' });
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

module.exports = {
  generateFeatureTemplate,
  generateScenarioTemplate,
  generateScenarioOutlineTemplate,
  generateDataTable,
  generateDocString,
  generateRuleTemplate,
  generateBackgroundTemplate,
  generateStepDefinitionTemplate,
  parseStepParameters,
  stepToCucumberExpression,
  validateFeatureStructure,
};
