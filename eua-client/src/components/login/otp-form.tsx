import { Button } from "antd";
import { useState } from "react";
import OtpInput from "react-otp-input";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../../redux/slice/user";
import { validateOTP } from "./api";

const OtpForm = ({
    requestData: { transactionId, requesterId },
}: {
    requestData: {
        transactionId: string;
        requesterId: string;
    };
}) => {
    const [otp, setOTP] = useState("");
    const isSubmitActive = otp && otp.length === 6;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleSubmitPress = () => {
        setIsSubmitting(true);
        validateOTP({
            transactionId,
            requesterId,
            otp,
        })
            .then(({ data }) => {
                localStorage.setItem("auth-token", data.data.token);
                dispatch(
                    updateProfile({
                        profile: data.data.profile,
                    })
                );
                navigate("/eua/search");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <div className="otp-form">
            <div className="otp-input-container">
                <span className="input-label">
                    We have sent OTP on your ABHA Address <b>xxx@sbx</b>
                </span>
                <OtpInput
                    numInputs={6}
                    onChange={(v: string) => {
                        console.log("this is my val", v);
                        setOTP(v);
                    }}
                    shouldAutoFocus
                    isInputNum
                    value={otp}
                    className="otp-input"
                />
            </div>
            <div className="otp-submit-btn-container">
                <Button
                    className={`otp-submit-btn${
                        isSubmitActive ? "" : " disabled"
                    }`}
                    disabled={!isSubmitActive}
                    onClick={handleSubmitPress}
                    loading={isSubmitting}
                >
                    {"SUBMIT"}
                </Button>
            </div>
        </div>
    );
};

export default OtpForm;