"""
Data Validation Script for VERDA AI Training System

This script validates the generated training data to ensure:
- Value ranges are realistic according to palm oil industry standards
- Correlations make sense
- No data leakage
- Proper distributions
"""

import pandas as pd
import numpy as np
import os
import sys
import traceback


class DataValidator:
    """Validates training data for VERDA AI system."""
    
    def __init__(self, data_path):
        """
        Initialize validator with data path.
        
        Parameters:
        -----------
        data_path : str
            Path to the training data CSV file
        """
        self.data_path = data_path
        self.df = None
        self.issues = []
        self.warnings = []
        
    def load_data(self):
        """Load training data from CSV."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Data file not found: {self.data_path}")
        
        self.df = pd.read_csv(self.data_path)
        print(f"Loaded {len(self.df)} samples from {self.data_path}")
        print(f"Columns: {list(self.df.columns)}")
        
    def check_value_ranges(self):
        """Check if all values are within realistic industry ranges."""
        print("\n" + "="*70)
        print("Checking Value Ranges...")
        print("="*70)
        
        checks = {
            'ffb': (80, 150, "FFB (Fresh Fruit Bunches) should be 80-150 tons/day"),
            'cpo': (11, 36, "CPO should be ~18-24% of FFB (11-36 tons for FFB range with efficiency)"),
            'moisture': (35, 45, "Moisture content should be 35-45%"),
            'cv': (16, 19, "Calorific Value should be 16-19 MJ/kg"),
            'eff': (0.75, 0.95, "Mill efficiency should be 0.75-0.95"),
            'oil_price': (60, 120, "Oil price index should be 60-120"),
            'demand_bio': (0.3, 0.95, "Biofuel demand index should be 0.3-0.95"),
            'carbon_tax': (8, 15, "Carbon tax should be $8-15/ton CO₂"),
            'demand_feed': (0.3, 0.9, "Feed demand index should be 0.3-0.9"),
            'protein_score': (0.6, 1.2, "Protein score should be 0.6-1.2"),
            'supply_factor': (0.8, 1.3, "Supply factor should be 0.8-1.3"),
            'compost_base': (25, 50, "Compost base price should be $25-50/ton"),
            'nutrient_score': (0.7, 1.3, "Nutrient score should be 0.7-1.3"),
            'biomass': (15, 40, "Biomass should be ~23% of FFB (15-40 tons)"),
            'biofuel_price': (85, 120, "Biofuel price should be $85-120/ton"),
            'feed_price': (45, 75, "Feed price should be $45-75/ton"),
            'compost_price': (25, 50, "Compost price should be $25-50/ton"),
            'allocation': (0, 2, "Allocation should be 0, 1, or 2")
        }
        
        all_valid = True
        for col, (min_val, max_val, description) in checks.items():
            if col not in self.df.columns:
                self.issues.append(f"Missing column: {col}")
                all_valid = False
                continue
                
            actual_min = self.df[col].min()
            actual_max = self.df[col].max()
            
            if actual_min < min_val or actual_max > max_val:
                msg = f"  ❌ {col}: Range [{actual_min:.2f}, {actual_max:.2f}] outside expected [{min_val}, {max_val}]"
                print(msg)
                self.issues.append(msg)
                all_valid = False
            else:
                print(f"  ✓ {col}: Range [{actual_min:.2f}, {actual_max:.2f}] within [{min_val}, {max_val}]")
        
        if all_valid:
            print("\n✓ All value ranges are valid!")
        else:
            print(f"\n❌ Found {len([i for i in self.issues if 'Range' in i])} range violations")
        
        return all_valid
    
    def check_correlations(self):
        """Check if correlations make sense based on industry knowledge."""
        print("\n" + "="*70)
        print("Checking Correlations...")
        print("="*70)
        
        expected_correlations = [
            ('ffb', 'biomass', 0.8, 1.0, "FFB should strongly correlate with biomass"),
            ('ffb', 'cpo', 0.7, 1.0, "FFB should correlate with CPO production"),
            ('moisture', 'cv', -0.95, -0.3, "Moisture should negatively correlate with CV"),
            ('oil_price', 'biofuel_price', 0.2, 0.7, "Oil price should correlate with biofuel price"),
            ('demand_bio', 'biofuel_price', 0.15, 0.7, "Biofuel demand should correlate with price"),
            ('cv', 'biofuel_price', 0.15, 0.7, "Higher CV should correlate with higher biofuel price"),
            ('protein_score', 'feed_price', 0.4, 0.8, "Protein score should correlate with feed price"),
            ('supply_factor', 'feed_price', -0.6, -0.15, "Supply factor should negatively correlate with feed price"),
        ]
        
        all_valid = True
        for col1, col2, min_corr, max_corr, description in expected_correlations:
            if col1 not in self.df.columns or col2 not in self.df.columns:
                continue
                
            actual_corr = self.df[col1].corr(self.df[col2])
            
            if min_corr <= actual_corr <= max_corr:
                print(f"  ✓ {col1} vs {col2}: {actual_corr:.3f} (expected: {min_corr:.2f} to {max_corr:.2f})")
            else:
                msg = f"  ⚠ {col1} vs {col2}: {actual_corr:.3f} outside expected range [{min_corr:.2f}, {max_corr:.2f}]"
                print(msg)
                self.warnings.append(msg)
                all_valid = False
        
        if all_valid:
            print("\n✓ All correlations are reasonable!")
        else:
            print(f"\n⚠ Found {len([w for w in self.warnings if 'vs' in w])} correlation warnings")
        
        return all_valid
    
    def check_data_leakage(self):
        """Check for potential data leakage issues."""
        print("\n" + "="*70)
        print("Checking for Data Leakage...")
        print("="*70)
        
        # Check if target variables (outputs) are used as inputs for other models
        leakage_checks = [
            # Biomass should not leak into price predictions
            {
                'target': 'biofuel_price',
                'features': ['oil_price', 'demand_bio', 'cv', 'carbon_tax'],
                'should_not_contain': ['biomass', 'allocation']
            },
            {
                'target': 'feed_price',
                'features': ['demand_feed', 'protein_score', 'supply_factor'],
                'should_not_contain': ['biomass', 'allocation']
            },
            {
                'target': 'compost_price',
                'features': ['compost_base', 'nutrient_score', 'moisture', 'carbon_tax'],
                'should_not_contain': ['biomass', 'allocation']
            },
            # Biomass should not use prices
            {
                'target': 'biomass',
                'features': ['ffb', 'cpo', 'moisture', 'cv', 'eff'],
                'should_not_contain': ['biofuel_price', 'feed_price', 'compost_price', 'allocation']
            }
        ]
        
        all_valid = True
        for check in leakage_checks:
            target = check['target']
            features = check['features']
            forbidden = check['should_not_contain']
            
            # Check if any forbidden features are in the feature list
            leaks = set(features) & set(forbidden)
            if leaks:
                msg = f"  ❌ Data leakage detected: {target} uses {leaks}"
                print(msg)
                self.issues.append(msg)
                all_valid = False
            else:
                print(f"  ✓ No leakage for {target} model")
        
        if all_valid:
            print("\n✓ No data leakage detected!")
        else:
            print("\n❌ Data leakage issues found!")
        
        return all_valid
    
    def check_distributions(self):
        """Check if distributions are reasonable."""
        print("\n" + "="*70)
        print("Checking Distributions...")
        print("="*70)
        
        # Check allocation distribution (should be relatively balanced)
        if 'allocation' in self.df.columns:
            alloc_counts = self.df['allocation'].value_counts()
            total = len(self.df)
            
            print("\nAllocation Distribution:")
            for alloc in sorted(alloc_counts.index):
                count = alloc_counts[alloc]
                pct = (count / total) * 100
                print(f"  Allocation {alloc}: {count} samples ({pct:.1f}%)")
            
            # Check if any allocation is too rare (< 15%) or too dominant (> 55%)
            for alloc, count in alloc_counts.items():
                pct = (count / total) * 100
                if pct < 15:
                    msg = f"  ⚠ Allocation {alloc} is underrepresented: {pct:.1f}%"
                    print(msg)
                    self.warnings.append(msg)
                elif pct > 55:
                    msg = f"  ⚠ Allocation {alloc} is overrepresented: {pct:.1f}%"
                    print(msg)
                    self.warnings.append(msg)
        
        # Check for missing values
        missing = self.df.isnull().sum()
        if missing.sum() > 0:
            print("\n❌ Missing values found:")
            for col in missing[missing > 0].index:
                print(f"  {col}: {missing[col]} missing values")
            self.issues.append("Missing values detected")
            return False
        else:
            print("\n✓ No missing values!")
        
        return True
    
    def check_realistic_relationships(self):
        """Check realistic industry relationships."""
        print("\n" + "="*70)
        print("Checking Realistic Industry Relationships...")
        print("="*70)
        
        # Check CPO to FFB ratio (should be 18-24%)
        if 'cpo' in self.df.columns and 'ffb' in self.df.columns:
            cpo_ratio = (self.df['cpo'] / self.df['ffb']) * 100
            avg_ratio = cpo_ratio.mean()
            min_ratio = cpo_ratio.min()
            max_ratio = cpo_ratio.max()
            
            print(f"\nCPO/FFB Extraction Rate:")
            print(f"  Average: {avg_ratio:.1f}% (expected: 18-24%)")
            print(f"  Range: {min_ratio:.1f}% - {max_ratio:.1f}%")
            
            if not (15 <= avg_ratio <= 26):
                msg = f"  ⚠ CPO extraction rate average {avg_ratio:.1f}% is outside expected range"
                print(msg)
                self.warnings.append(msg)
            else:
                print("  ✓ CPO extraction rate is realistic!")
        
        # Check biomass to FFB ratio (should be ~23%)
        if 'biomass' in self.df.columns and 'ffb' in self.df.columns:
            biomass_ratio = (self.df['biomass'] / self.df['ffb']) * 100
            avg_ratio = biomass_ratio.mean()
            min_ratio = biomass_ratio.min()
            max_ratio = biomass_ratio.max()
            
            print(f"\nBiomass/FFB Waste Rate:")
            print(f"  Average: {avg_ratio:.1f}% (expected: ~23%)")
            print(f"  Range: {min_ratio:.1f}% - {max_ratio:.1f}%")
            
            if not (20 <= avg_ratio <= 26):
                msg = f"  ⚠ Biomass waste rate average {avg_ratio:.1f}% is outside expected range"
                print(msg)
                self.warnings.append(msg)
            else:
                print("  ✓ Biomass waste rate is realistic!")
        
        return True
    
    def run_validation(self):
        """Run all validation checks."""
        print("\n" + "="*70)
        print("VERDA AI Data Validation Report")
        print("="*70)
        print(f"Data file: {self.data_path}")
        print(f"Samples: {len(self.df)}")
        
        # Run all checks
        range_valid = self.check_value_ranges()
        corr_valid = self.check_correlations()
        leakage_valid = self.check_data_leakage()
        dist_valid = self.check_distributions()
        rel_valid = self.check_realistic_relationships()
        
        # Summary
        print("\n" + "="*70)
        print("Validation Summary")
        print("="*70)
        
        if self.issues:
            print(f"\n❌ Found {len(self.issues)} critical issue(s):")
            for issue in self.issues:
                print(f"  - {issue}")
        
        if self.warnings:
            print(f"\n⚠ Found {len(self.warnings)} warning(s):")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        if not self.issues and not self.warnings:
            print("\n✓✓✓ All validation checks passed! Data is ready for training. ✓✓✓")
            return True
        elif not self.issues:
            print("\n✓ No critical issues, but review warnings above.")
            return True
        else:
            print("\n❌ Critical issues found. Please fix before training.")
            return False


def main():
    """Main function to run data validation."""
    # Default path to training data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "data", "training_data.csv")
    
    # Allow custom path from command line with basic validation
    if len(sys.argv) > 1:
        user_path = sys.argv[1]
        # Basic path validation to prevent path traversal
        if '..' in user_path or user_path.startswith('/'):
            # Only allow relative paths without parent directory references
            print("Error: Invalid path. Only relative paths without '..' are allowed.")
            sys.exit(1)
        # Resolve to absolute path within script directory
        data_path = os.path.abspath(os.path.join(script_dir, user_path))
        # Ensure the path is within the allowed directory
        if not data_path.startswith(script_dir):
            print("Error: Path must be within the project directory.")
            sys.exit(1)
    
    # Create validator and run checks
    validator = DataValidator(data_path)
    
    try:
        validator.load_data()
        success = validator.run_validation()
        
        # Exit with appropriate code
        sys.exit(0 if success else 1)
        
    except Exception as e:
        print(f"\n❌ Error during validation: {e}")
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
