import { useEffect, useState } from "react";
import "../../pages/styles.css";

const SuccessNotification = (props) => {
  const { customMessage } = props;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="success-toast alert alert-success">
      {customMessage ? (
        <p>{customMessage}</p>
      ) : (
        <p>✅ Pakeista sėkmingai!</p>
      )}
    </div>
  );
};

export default SuccessNotification;
