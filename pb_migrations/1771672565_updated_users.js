/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "resetPasswordTemplate": {
      "body": "<!DOCTYPE html>\n<html>\n<body style=\"margin: 0; padding: 0; background-color: #f4f7ff; font-family: sans-serif;\">\n    <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #f4f7ff; padding: 40px 20px;\">\n        <tr>\n            <td align=\"center\">\n                <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);\">\n                    <tr>\n                        <td align=\"center\" style=\"padding: 40px;\">\n                            <div style=\"width: 48px; height: 48px; background-color: #ef4444; border-radius: 12px; line-height: 48px; color: #ffffff; font-size: 24px; font-weight: bold;\">!</div>\n                            <h2 style=\"margin: 20px 0 10px 0; color: #1e293b; font-size: 24px;\">Reset your password</h2>\n                            <p style=\"color: #64748b; font-size: 16px; line-height: 24px;\">We received a request to reset the password for your Klasiz account.</p>\n                            <div style=\"margin: 30px 0;\">\n                                <a href=\"{APP_URL}/#/auth/confirm-password-reset/{TOKEN}\"  target=\"_blank\" \n                rel=\"noopener noreferrer\"   style=\"display: inline-block; background-color: #1e293b; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;\">Reset Password</a>\n                            </div>\n                            <p style=\"color: #94a3b8; font-size: 13px; line-height: 20px;\">If you didn't ask for this, you can safely ignore this email. Your password will stay the same.</p>\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    </table>\n</body>\n</html>"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "resetPasswordTemplate": {
      "body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>"
    }
  }, collection)

  return app.save(collection)
})
