use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SegmentIntersection {
    pub segment_names: Vec<String>,
    pub user_count: usize,
    pub percentage_of_total: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SegmentOverlapReport {
    pub segments: Vec<String>,
    pub intersections: Vec<SegmentIntersection>,
    pub total_unique_users: usize,
}

pub struct SegmentOverlapEngine;

impl SegmentOverlapEngine {
    pub fn compute_overlap(
        segment_a: (&str, &HashSet<String>),
        segment_b: (&str, &HashSet<String>),
        segment_c: Option<(&str, &HashSet<String>)>,
    ) -> SegmentOverlapReport {
        let mut all_users = segment_a.1.clone();
        all_users.extend(segment_b.1.iter().cloned());
        if let Some((_, set_c)) = segment_c {
            all_users.extend(set_c.iter().cloned());
        }
        let total = all_users.len().max(1);

        let mut intersections = Vec::new();

        // A only
        let a_only: HashSet<_> = segment_a.1.difference(segment_b.1).cloned().collect();
        let a_count = if let Some((_, set_c)) = segment_c {
            a_only.difference(set_c).count()
        } else {
            a_only.len()
        };
        intersections.push(SegmentIntersection {
            segment_names: vec![segment_a.0.to_string()],
            user_count: a_count,
            percentage_of_total: ((a_count as f64 / total as f64) * 1000.0).round() / 10.0,
        });

        // B only
        let b_only: HashSet<_> = segment_b.1.difference(segment_a.1).cloned().collect();
        let b_count = if let Some((_, set_c)) = segment_c {
            b_only.difference(set_c).count()
        } else {
            b_only.len()
        };
        intersections.push(SegmentIntersection {
            segment_names: vec![segment_b.0.to_string()],
            user_count: b_count,
            percentage_of_total: ((b_count as f64 / total as f64) * 1000.0).round() / 10.0,
        });

        // A & B intersection
        let ab: HashSet<_> = segment_a.1.intersection(segment_b.1).cloned().collect();
        let ab_count = if let Some((_, set_c)) = segment_c {
            ab.difference(set_c).count()
        } else {
            ab.len()
        };
        intersections.push(SegmentIntersection {
            segment_names: vec![segment_a.0.to_string(), segment_b.0.to_string()],
            user_count: ab_count,
            percentage_of_total: ((ab_count as f64 / total as f64) * 1000.0).round() / 10.0,
        });

        // If segment C exists
        let mut segment_names = vec![segment_a.0.to_string(), segment_b.0.to_string()];
        if let Some((name_c, set_c)) = segment_c {
            segment_names.push(name_c.to_string());
            // C only
            let mut c_only = set_c.clone();
            c_only.retain(|u| !segment_a.1.contains(u) && !segment_b.1.contains(u));
            intersections.push(SegmentIntersection {
                segment_names: vec![name_c.to_string()],
                user_count: c_only.len(),
                percentage_of_total: ((c_only.len() as f64 / total as f64) * 1000.0).round() / 10.0,
            });

            // A & B & C
            let abc: HashSet<_> = ab.intersection(set_c).cloned().collect();
            intersections.push(SegmentIntersection {
                segment_names: vec![segment_a.0.to_string(), segment_b.0.to_string(), name_c.to_string()],
                user_count: abc.len(),
                percentage_of_total: ((abc.len() as f64 / total as f64) * 1000.0).round() / 10.0,
            });
        }

        SegmentOverlapReport {
            segments: segment_names,
            intersections,
            total_unique_users: all_users.len(),
        }
    }
}
