export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  medical_conditions?: string;
  allergies?: string;
  medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string;
  guardian_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientWithGuardian extends Client {
  guardian?: {
    id: string;
    email: string;
    profile?: {
      role: string;
    };
  };
}

export interface CreateClientInput {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  medical_conditions?: string;
  allergies?: string;
  medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string;
  guardian_id?: string;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string;
}
