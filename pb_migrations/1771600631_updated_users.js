/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<!DOCTYPE html>\n<html>\n<head>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n</head>\n<body style=\"margin: 0; padding: 0; background-color: #f4f7ff; font-family: sans-serif;\">\n    <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #f4f7ff; padding: 40px 20px;\">\n        <tr>\n            <td align=\"center\">\n                <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);\">\n                    <tr>\n                        <td align=\"center\" style=\"padding: 40px 40px 20px 40px;\">\n                            <div style=\"width: 48px; height: 48px; background-color: #2563eb; border-radius: 12px; display: inline-block; line-height: 48px; color: #ffffff; font-size: 24px; font-weight: bold;\">K</div>\n                            <h2 style=\"margin: 20px 0 10px 0; color: #1e293b; font-size: 24px;\">Confirm your email</h2>\n                            <p style=\"margin: 0; color: #64748b; font-size: 16px;\">Welcome to {APP_NAME}</p>\n                        </td>\n                    </tr>\n                    <tr>\n                        <td align=\"center\" style=\"padding: 0 40px 40px 40px;\">\n                            <p style=\"color: #475569; font-size: 15px; line-height: 24px; margin-bottom: 30px;\">\n                                Tap the button below to confirm your email address and go to your portal.\n                            </p>\n                            <a href=\"{APP_URL}/api/confirm-verification/{TOKEN}?redirectUrl=https://klasiz.fun/%23portal\" \n                               style=\"display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;\">\n                               Verify and Login\n                            </a>\n                        </td>\n                    </tr>\n                    <tr>\n                        <td align=\"center\" style=\"padding: 20px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;\">\n                            <p style=\"margin: 0; color: #94a3b8; font-size: 12px;\">\n                                Thanks, <br> {APP_NAME} Team\n                            </p>\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    </table>\n</body>\n</html>"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>"
    }
  }, collection)

  return app.save(collection)
})
