# **App Name**: GHSS Grants Portal

## Core Features:

- Multilingual Application Form: A multi-step form supporting both English and French, dynamically mapping to the existing Firestore schema within the ghss-grant-manager project.
- Firestore Integration: Direct integration with Firestore to read from and write to the existing collections within the ghss-grant-manager project.
- Super Admin Authentication: Secure authentication and authorization using the specified Super Admin UID (5RBc7GzSyLTPnBh0NRzNZccp7aK2) to ensure restricted access.
- AI-Powered Content Assistance: Use AI to act as a tool to suggest content for each step of the form to guide users. The AI will strictly act as a helper for those internal rules defined in the local guidance.json file.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke trust and authority.
- Background color: Light blue (#E8EAF6) for a clean, professional feel.
- Accent color: Teal (#009688) to highlight important actions and elements.
- Body and headline font: 'Inter' for a modern, objective, neutral style, ensuring readability and a professional look.
- Use simple, professional icons from a library like Material Design Icons.
- A clean, structured layout with clear sections for each step of the application process.
- Subtle animations and transitions to provide feedback during form completion.