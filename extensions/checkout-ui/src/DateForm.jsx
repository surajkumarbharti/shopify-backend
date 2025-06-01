import {
  reactExtension,
  Banner,
  BlockStack,
  Button,
  DatePicker,
  Text,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

export default reactExtension(
  "purchase.thank-you.block.render",
  () => <Extension />
);

function Extension() {
  const { extension, order } = useApi();
  const [birthday, setBirthday] = useState("");
  const [anniversary, setAnniversary] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      // Use environment variable for the API URL
      const API_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api/save-dates'  // Replace with your production URL
        : 'http://localhost:3001/api/save-dates';

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          birthday,
          anniversary,
          orderId: order.id,
          customerId: order.customer?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Dates saved successfully!" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save dates" });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: "error", text: "Error saving dates" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BlockStack spacing="loose">
      <Text size="large" emphasis="bold">
        Save Your Special Dates
      </Text>
      <Text>We'd love to celebrate with you!</Text>

      <BlockStack spacing="tight">
        <Text>Birthday</Text>
        <DatePicker
          selected={birthday}
          onChange={(date) => setBirthday(date)}
        />
      </BlockStack>

      <BlockStack spacing="tight">
        <Text>Anniversary</Text>
        <DatePicker
          selected={anniversary}
          onChange={(date) => setAnniversary(date)}
        />
      </BlockStack>

      <Button
        kind="primary"
        onPress={handleSave}
        loading={isSaving}
        disabled={!birthday || !anniversary || isSaving}
      >
        Save Dates
      </Button>

      {message && (
        <Banner
          status={message.type === "success" ? "success" : "critical"}
          title={message.text}
        />
      )}
    </BlockStack>
  );
} 