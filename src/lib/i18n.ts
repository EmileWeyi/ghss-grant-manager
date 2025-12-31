export const translations = {
  en: {
    // Header
    logout: 'Logout',
    // Stepper
    step_applicant_info: 'Applicant Info',
    step_project_details: 'Project Details',
    step_budget: 'Budget',
    step_review_submit: 'Review & Submit',
    // General Buttons
    next_step: 'Next Step',
    previous_step: 'Previous Step',
    submit_application: 'Submit Application',
    get_suggestion: 'Get AI Suggestion',
    // Applicant Info Step
    applicant_name: 'Applicant Name',
    applicant_name_placeholder: 'e.g., Global Health & Safety Solutions',
    contact_email: 'Contact Email',
    contact_email_placeholder: 'e.g., contact@ghss.org',
    organization_type: 'Organization Type',
    org_type_ngo: 'Non-Governmental Organization (NGO)',
    org_type_academic: 'Academic Institution',
    org_type_gov: 'Government Entity',
    org_type_other: 'Other',
    // Project Details Step
    project_title: 'Project Title',
    project_title_placeholder: 'e.g., Community Health Initiative in West Africa',
    project_description: 'Project Description',
    project_description_placeholder: 'Describe the project goals, activities, and expected outcomes...',
    supporting_documents: 'Links to Supporting Documents',
    supporting_documents_placeholder: 'e.g., https://link-to-your-doc.com/proposal.pdf',
    // Budget Step
    total_amount: 'Total Amount Requested ($USD)',
    total_amount_placeholder: 'e.g., 50000',
    budget_breakdown: 'Budget Breakdown',
    budget_breakdown_placeholder: 'Provide a detailed list of expenses...',
    // Review Step
    review_title: 'Review Your Application',
    review_description: 'Please review all the information carefully before submitting.',
    // Toasts
    submission_success_title: 'Submission Successful',
    submission_success_description: 'Your grant application has been submitted.',
    submission_error_title: 'Submission Failed',
    submission_error_description: 'An error occurred. Please try again.',
    ai_error_description: 'Could not get AI suggestion. Please try again.',
  },
  fr: {
    // Header
    logout: 'Déconnexion',
    // Stepper
    step_applicant_info: 'Infos du Candidat',
    step_project_details: 'Détails du Projet',
    step_budget: 'Budget',
    step_review_submit: 'Vérifier et Soumettre',
    // General Buttons
    next_step: 'Étape Suivante',
    previous_step: 'Étape Précédente',
    submit_application: "Soumettre la Demande",
    get_suggestion: 'Obtenir une Suggestion IA',
    // Applicant Info Step
    applicant_name: 'Nom du Candidat',
    applicant_name_placeholder: 'ex: Global Health & Safety Solutions',
    contact_email: 'Email de Contact',
    contact_email_placeholder: 'ex: contact@ghss.org',
    organization_type: "Type d'Organisation",
    org_type_ngo: 'Organisation Non Gouvernementale (ONG)',
    org_type_academic: 'Établissement Académique',
    org_type_gov: 'Entité Gouvernementale',
    org_type_other: 'Autre',
    // Project Details Step
    project_title: 'Titre du Projet',
    project_title_placeholder: "ex: Initiative de Santé Communautaire en Afrique de l'Ouest",
    project_description: 'Description du Projet',
    project_description_placeholder: 'Décrivez les objectifs, activités et résultats attendus du projet...',
    supporting_documents: 'Liens vers les Documents Justificatifs',
    supporting_documents_placeholder: 'ex: https://lien-vers-votre-doc.com/proposition.pdf',
    // Budget Step
    total_amount: 'Montant Total Demandé ($USD)',
    total_amount_placeholder: 'ex: 50000',
    budget_breakdown: 'Répartition du Budget',
    budget_breakdown_placeholder: 'Fournissez une liste détaillée des dépenses...',
    // Review Step
    review_title: 'Vérifiez Votre Demande',
    review_description: 'Veuillez vérifier attentivement toutes les informations avant de soumettre.',
    // Toasts
    submission_success_title: 'Soumission Réussie',
    submission_success_description: 'Votre demande de subvention a été soumise.',
    submission_error_title: 'Échec de la Soumission',
    submission_error_description: 'Une erreur est survenue. Veuillez réessayer.',
    ai_error_description: "Impossible d'obtenir la suggestion de l'IA. Veuillez réessayer.",
  },
};

export type TranslationKeys = keyof typeof translations.en;
