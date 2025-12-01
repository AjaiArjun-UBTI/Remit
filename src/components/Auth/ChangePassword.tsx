import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDiligenceFabricSDK } from "../../services/DFService";
import { showToast } from "../../utils/toastUtils";

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ChangePassword: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const initialValues: FormValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validate(formValues);
    setFormErrors(errors);
    setIsSubmit(true);

    // If no errors, proceed immediately (no need to wait for next render)
    if (Object.keys(errors).length === 0) {
      changeUserPassword(formValues);
    }
  };

  const validate = (values: FormValues): FormErrors => {
    const errors: FormErrors = {};

    if (!values.oldPassword.trim()) {
      errors.oldPassword = "Old password is required";
    }

    if (!values.newPassword.trim()) {
      errors.newPassword = "New password is required";
    }

    if (!values.confirmPassword.trim()) {
      errors.confirmPassword = "Confirm password is required";
    } else if (values.newPassword !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const changeUserPassword = async (passwordData: FormValues) => {
    setIsLoading(true);
    setError("");

    try {
      const client = getDiligenceFabricSDK();
      const response = await client
        .getAuthService()
        .changePassword({
          oldPassword: passwordData.oldPassword,
          isResetPassword: 1,
          dfUPassword: passwordData.newPassword,
        });

      if (response.Result) {
        localStorage.setItem("userData", JSON.stringify(response.Result));
        showToast("Password changed successfully!", "success");
        navigate(-1);
      } else {
        throw new Error(response.Message || "Change password failed");
      }
    } catch (err: any) {
      const message = err?.message || "Password change failed";
      showToast(message, "error");
      setError(message);
      console.error("Error changing password:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Reset submit state after submission
  useEffect(() => {
    if (isSubmit && Object.keys(formErrors).length === 0) {
      setIsSubmit(false);
    }
  }, [formErrors, isSubmit]);

  return (
    <div className="min-h-screen flex items-center justify-center mt-5 px-4">
      <div className="relative w-full max-w-lg">
        <div className="absolute top-[-60px] left-1/2 transform -translate-x-1/2">
          <img
            src="/src/assets/DF-Logo.svg" // Use /src if using Vite (or correct path)
            className="h-36 w-auto max-w-full"
            alt="Logo"
          />
        </div>

        <div className="pt-10">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h4 className="text-2xl font-bold text-gray-800 text-left mb-6">
                           Reset Password
            </h4>

            {error && <div className="text-center text-red-500 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Old Password */}
              <div>
                <label htmlFor="oldPassword" className="block text-lg font-medium text-gray-700">
                  Old Password
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 text-base"
                  placeholder="Enter old password"
                  value={formValues.oldPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {formErrors.oldPassword && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.oldPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-lg font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 text-base"
                  placeholder="Enter new password"
                  value={formValues.newPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {formErrors.newPassword && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 text-base"
                  placeholder="Confirm new password"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-3 rounded-md bg-primary-600 px-4 py-3 text-white font-semibold hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Changing Password...</span>
                  </>
                ) : (
                  "Change Password"
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-gray-600 underline hover:text-gray-800"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;