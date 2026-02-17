# 🛒 E‑Commerce Consumer Behavior Analysis

Hackathon-style exploratory analysis of e-commerce consumer behavior, including data cleaning, EDA dashboards, statistical tests, and machine learning models.

Repository contains the full executed notebook and dataset:
- `Ecommerce_Consumer_Behavior_Analysis.ipynb`
- `Ecommerce_Consumer_Behavior_Analysis_Data.csv`

---

## Quickstart

### Option A — Run the notebook (recommended)
1. Create/activate a Python environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Open `Ecommerce_Consumer_Behavior_Analysis.ipynb` in Jupyter / VS Code and run cells top-to-bottom.

### Option B — Minimal install (if you only need core EDA)
```bash
pip install pandas numpy matplotlib seaborn plotly scikit-learn scipy statsmodels nbformat
```

---

## Report (with notebook outputs)

### 1) Dataset overview

```text
📊 Dataset Shape: 1,000 rows × 28 columns

📋 Column Names:
    1. Customer_ID
    2. Age
    3. Gender
    4. Income_Level
    5. Marital_Status
    6. Education_Level
    7. Occupation
    8. Location
    9. Purchase_Category
   10. Purchase_Amount
   11. Frequency_of_Purchase
   12. Purchase_Channel
   13. Brand_Loyalty
   14. Product_Rating
   15. Time_Spent_on_Product_Research(hours)
   16. Social_Media_Influence
   17. Discount_Sensitivity
   18. Return_Rate
   19. Customer_Satisfaction
   20. Engagement_with_Ads
   21. Device_Used_for_Shopping
   22. Payment_Method
   23. Time_of_Purchase
   24. Discount_Used
   25. Customer_Loyalty_Program_Member
   26. Purchase_Intent
   27. Shipping_Preference
   28. Time_to_Decision
```

### 2) Data cleaning summary

Key transformations:
- `Purchase_Amount`: currency string → float
- `Time_of_Purchase`: parsed to datetime + derived `Purchase_Month`, `Purchase_DayOfWeek`
- Boolean-like columns mapped to 0/1
- Encodings created for analysis (`Income_Encoded`, `Gender_Encoded`, `Purchase_Intent_Encoded`)

Missing values reported by the notebook:

```text
✅ Data Cleaning Complete!

⚠️ Missing Values:
                        Missing Count  Percentage (%)
Social_Media_Influence            247            24.7
Engagement_with_Ads               256            25.6
```

### 3) Exploratory analysis

The notebook includes interactive Plotly dashboards/plots for:
- Demographics distributions (age, gender, income, education, marital status)
- Purchase behavior (category treemap, purchase amount distribution, channel/frequency)
- Satisfaction deep-dives (box/violin/scatter)
- Digital footprint & engagement
- Loyalty & retention
- Purchase intent and time trends
<img width="1463" height="985" alt="image" src="https://github.com/user-attachments/assets/d0049cb3-3f75-4a66-a589-e4ed53e2e15c" />
<img width="1600" height="576" alt="image" src="https://github.com/user-attachments/assets/03734a4c-9c4a-46c4-ab07-34545d30d811" />
<img width="1600" height="595" alt="image" src="https://github.com/user-attachments/assets/55c46dbb-590e-445f-acae-cb40d06698ed" />
<img width="1600" height="673" alt="image" src="https://github.com/user-attachments/assets/328e96f2-e6d4-4adc-bedc-bc6e2cb85436" />
<img width="1600" height="553" alt="image" src="https://github.com/user-attachments/assets/89fbcc86-1a46-492c-825a-91ec6152626f" />
<img width="1600" height="601" alt="image" src="https://github.com/user-attachments/assets/c192011b-fb14-43ba-9b4a-8e29024c7ba5" />
<img width="1600" height="553" alt="image" src="https://github.com/user-attachments/assets/d62f83b2-4507-41aa-bea4-e77b6fa00c31" />
<img width="1600" height="604" alt="image" src="https://github.com/user-attachments/assets/668664c7-723d-43c0-b5e4-32d5154ef55f" />
<img width="1600" height="569" alt="image" src="https://github.com/user-attachments/assets/83b9a221-299f-4464-8782-4a7434d78245" />
<img width="1600" height="604" alt="image" src="https://github.com/user-attachments/assets/4358ee77-b45f-4fc3-81e1-da6b392b1212" />
<img width="1600" height="571" alt="image" src="https://github.com/user-attachments/assets/ab913341-3f22-4bae-96a4-ecfd179978a5" />
<img width="1600" height="548" alt="image" src="https://github.com/user-attachments/assets/0ec885ad-e49e-4ae8-93c7-25c1a4b9b8cf" />
<img width="1600" height="560" alt="image" src="https://github.com/user-attachments/assets/0f09b17f-0b7a-4512-9e1c-321722f5c6a9" />
<img width="1600" height="544" alt="image" src="https://github.com/user-attachments/assets/795b7b31-637b-4903-9fe2-6d756a9e5695" />



### 4) Statistical tests

#### Chi-square tests (categorical associations)

```text
📊 Chi-Square Tests for Key Categorical Associations
============================================================

Gender vs Purchase_Intent:
  Chi² = 17.141, p-value = 0.7025 → ❌ Not Significant

Income_Level vs Purchase_Intent:
  Chi² = 3.738, p-value = 0.2912 → ❌ Not Significant

Income_Level vs Discount_Sensitivity:
  Chi² = 1.679, p-value = 0.4319 → ❌ Not Significant

Gender vs Purchase_Channel:
  Chi² = 10.203, p-value = 0.7472 → ❌ Not Significant

Education_Level vs Purchase_Intent:
  Chi² = 12.998, p-value = 0.0431 → ✅ Significant

Marital_Status vs Customer_Loyalty_Program_Member:
  Chi² = 1.214, p-value = 0.7497 → ❌ Not Significant
```
<img width="1580" height="1259" alt="image" src="https://github.com/user-attachments/assets/a94a1fc9-e40f-47ee-b29c-417199dbc0f3" />

#### ANOVA

```text
📊 ANOVA — Customer Satisfaction across Purchase Categories
   F-statistic: 1.144
   p-value: 0.2896
   Result: ❌ No significant difference

📊 ANOVA — Purchase Amount across Income Levels
   F-statistic: nan
   p-value: nan
   Result: ❌ No significant difference
```

Note: ANOVA for purchase amount across income levels produced `nan` in this run, which typically happens when at least one group has insufficient variance or missing/invalid values.

### 5) Machine learning results

#### 5.2 Purchase Intent prediction (multi-class)

Baseline models:

```text
🎯 PURCHASE INTENT PREDICTION RESULTS
=======================================================

🌲 Random Forest Accuracy: 0.2400 (24.0%)
📊 Gradient Boosting Accuracy: 0.2360 (23.6%)

🏆 Best Model: Random Forest
```
<img width="1600" height="642" alt="image" src="https://github.com/user-attachments/assets/d1594bda-f723-4731-b8bc-66e95ca7917d" />

Tuned model (RandomizedSearchCV over RF/ExtraTrees):

```text
🏁 Hyperparameter Tuning Summary (CV Accuracy)
        Model  Best CV Accuracy
Random Forest          0.288000
  Extra Trees          0.274667

🎯 TUNED PURCHASE INTENT RESULTS
=======================================================
🏆 Best tuned model: Random Forest
✅ CV Accuracy (train): 0.2880
✅ Test Accuracy:       0.2280 (22.8%)
```

Interpretation: Purchase intent is hard to predict accurately from the available tabular signals; tuning does not materially improve generalization.

#### 5.3 Customer Satisfaction prediction (regression)

```text
⭐ CUSTOMER SATISFACTION PREDICTION RESULTS
=======================================================
   RMSE: 3.0419
   MAE:  2.5386
   R²:   -0.1847
```
<img width="1600" height="562" alt="image" src="https://github.com/user-attachments/assets/6cad50b3-a4a2-4212-bfb8-ad0ad7e6a5fe" />
<img width="1600" height="613" alt="image" src="https://github.com/user-attachments/assets/a1f6d455-0a8d-41d8-ab4a-712f51c0c03d" />

Negative $R^2$ indicates this model underperforms a naive baseline (predicting the mean) on this particular split.

#### 5.4 Loyalty program membership prediction (binary)

Baseline models:

```text
💳 LOYALTY PROGRAM MEMBERSHIP PREDICTION
=======================================================

📊 Logistic Regression — Accuracy: 0.5320, AUC: 0.5655
🌲 Random Forest      — Accuracy: 0.5200, AUC: 0.5173

🏆 Best Model (by AUC): Logistic Regression
```
<img width="1600" height="570" alt="image" src="https://github.com/user-attachments/assets/77cff003-cb82-4ee2-b80a-fb37b40282f1" />

Tuned model (optimize ROC-AUC):

```text
💳 TUNED LOYALTY PROGRAM MEMBERSHIP PREDICTION
============================================================
🏆 Best tuned model: Random Forest
✅ CV ROC-AUC (train): 0.5047
✅ Test ROC-AUC:       0.5008
✅ Test Accuracy:      0.5320 (53.2%)
```

Interpretation: tuned performance is close to random-chance ROC-AUC (~0.5), suggesting limited predictive signal in the current feature set for loyalty membership.

#### 5.5 Customer segmentation (K-Means)

```text
🏆 Optimal K = 8 (Silhouette = 0.0990)
```
<img width="1600" height="641" alt="image" src="https://github.com/user-attachments/assets/57edbb9e-eedf-4047-b0c8-dc44ae488083" />

Cluster profiling output (means + sizes) is printed in the notebook for review.
<img width="1600" height="511" alt="image" src="https://github.com/user-attachments/assets/3f287c33-811c-4220-8f70-c324e4987b69" />

### 6) Completion marker

```text
============================================================
  🎯 ANALYSIS COMPLETE — ALL DELIVERABLES GENERATED
============================================================

  ✅ Data Cleaned & Prepared
  ✅ 15+ Interactive Visualizations
  ✅ Statistical Tests (Chi-Square, ANOVA)  
  ✅ 3 ML Models + 1 Clustering Model
  ✅ Key Insights & Recommendations
```
<img width="1600" height="652" alt="image" src="https://github.com/user-attachments/assets/69b0b971-aa2e-4df8-8efc-75718cd27d20" />

---

## Notes / limitations

- Model accuracy is constrained by the dataset’s available signal and feature design. For meaningfully better performance, consider:
  - One-hot encoding (instead of label encoding) for non-ordinal categorical variables
  - Better missing-value imputation strategies
  - Additional feature engineering from timestamps (`Time_of_Purchase`) and interactions
  - Trying calibrated linear models or boosted trees with careful leakage checks
