resource "azurerm_logic_app_action_custom" "example" {
  name         = "example-action"
  logic_app_id = azurerm_logic_app_workflow.example.id

  body = <<BODY
{
    "description": "A variable to ${var.thing} configure the auto expiration age in days. Configured in negative number. Default is -30 (30 days old).",
    "inputs": {
        "variables": [
            {
                "name": "ExpirationAgeInDays",
                "type": "Integer",
                "value": -30
            }
        ]
    },
    "runMeBaby": {
      "docker_something": "${var.registry}"
    },
    "runAfter": {},
    "type": "InitializeVariable"
}
BODY

}
