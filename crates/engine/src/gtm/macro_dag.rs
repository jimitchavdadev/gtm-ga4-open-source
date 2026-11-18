use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone)]
pub struct MacroVariable {
    pub name: String,
    pub template: String,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct MacroDagResolver {
    variables: HashMap<String, MacroVariable>,
}

impl MacroDagResolver {
    pub fn new() -> Self {
        Self {
            variables: HashMap::new(),
        }
    }

    pub fn add_variable(&mut self, name: &str, template: &str, dependencies: Vec<String>) {
        self.variables.insert(
            name.to_string(),
            MacroVariable {
                name: name.to_string(),
                template: template.to_string(),
                dependencies,
            },
        );
    }

    pub fn has_circular_dependency(&self) -> bool {
        let mut visited = HashSet::new();
        let mut recursion_stack = HashSet::new();

        for name in self.variables.keys() {
            if !visited.contains(name)
                && self.check_cycle(name, &mut visited, &mut recursion_stack)
            {
                return true;
            }
        }
        false
    }

    fn check_cycle(
        &self,
        node: &str,
        visited: &mut HashSet<String>,
        stack: &mut HashSet<String>,
    ) -> bool {
        visited.insert(node.to_string());
        stack.insert(node.to_string());

        if let Some(var) = self.variables.get(node) {
            for dep in &var.dependencies {
                if !visited.contains(dep) {
                    if self.check_cycle(dep, visited, stack) {
                        return true;
                    }
                } else if stack.contains(dep) {
                    return true;
                }
            }
        }

        stack.remove(node);
        false
    }

    pub fn resolve_all(
        &self,
        context: &HashMap<String, String>,
    ) -> Result<HashMap<String, String>, String> {
        if self.has_circular_dependency() {
            return Err("Circular dependency detected in macro variables".to_string());
        }

        let mut memo = HashMap::new();
        for (k, v) in context {
            memo.insert(k.clone(), v.clone());
        }

        for name in self.variables.keys() {
            self.resolve_node(name, &mut memo)?;
        }

        Ok(memo)
    }

    fn resolve_node(
        &self,
        name: &str,
        memo: &mut HashMap<String, String>,
    ) -> Result<String, String> {
        if let Some(val) = memo.get(name) {
            return Ok(val.clone());
        }

        let var = match self.variables.get(name) {
            Some(v) => v.clone(),
            None => return Ok(format!("{{{{{}}}}}", name)),
        };

        let mut resolved = var.template.clone();
        for dep in &var.dependencies {
            let dep_val = self.resolve_node(dep, memo)?;
            resolved = resolved.replace(&format!("{{{{{}}}}}", dep), &dep_val);
        }

        memo.insert(name.to_string(), resolved.clone());
        Ok(resolved)
    }
}
