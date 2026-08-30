import {
  apiFetch,
  apiUploadForm,
  clearAccessToken,
  getAccessToken,
  isUnauthorizedError,
  setAccessToken,
} from '@/lib/api-client';

export type RegistrationDocumentInput = {
  url: string;
  key: string;
  filename: string;
  contentType: string;
};

export type RegistrationUploadResponse = RegistrationDocumentInput & {
  size: number;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  jobTitle: string | null;
  status: 'active' | 'disabled' | 'pending';
  role?: string;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthUserSummary = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  status: 'active' | 'disabled' | 'pending';
};

export type AuthTokenResponse = {
  token: string;
  user: AuthUserSummary;
  redirectPath?: string;
  message?: string;
};

export type AuthSession = {
  user: AuthUserSummary;
  redirectPath?: string;
  message?: string;
};

export type AuthRegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  documents?: RegistrationDocumentInput[];
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  _quick?: boolean;
};

function handleAuthResponse(response: AuthTokenResponse): AuthSession {
  if (response.token) {
    setAccessToken(response.token);
  }

  return {
    user: response.user,
    redirectPath: response.redirectPath,
    message: response.message,
  };
}

export function splitDisplayName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { firstName: 'User', lastName: 'User' };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    // Single token (common for Chinese names): duplicate to satisfy API min length.
    return { firstName: parts[0], lastName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export async function uploadRegistrationDocument(file: File): Promise<RegistrationDocumentInput> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiUploadForm<RegistrationUploadResponse>('/api/front/upload/registration', formData);

  return {
    url: response.url,
    key: response.key,
    filename: response.filename,
    contentType: response.contentType,
  };
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await apiFetch<AuthTokenResponse>('/api/front/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return handleAuthResponse(response);
}

export async function register(payload: AuthRegisterRequest): Promise<AuthSession> {
  const response = await apiFetch<AuthTokenResponse>('/api/front/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return handleAuthResponse(response);
}

export function logout(): void {
  clearAccessToken();
}

export type ProfileFetchResult =
  | { status: 'ok'; profile: UserProfile }
  | { status: 'unauthorized' }
  | { status: 'unavailable' };

export async function fetchProfile(): Promise<ProfileFetchResult> {
  if (!getAccessToken()) {
    return { status: 'unauthorized' };
  }

  try {
    const profile = await apiFetch<UserProfile>('/api/front/profile');
    return { status: 'ok', profile };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return { status: 'unauthorized' };
    }
    return { status: 'unavailable' };
  }
}
