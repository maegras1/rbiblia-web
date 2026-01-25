import React from "react";
import { useIntl } from "react-intl";
import LanguageSelector from "./LanguageSelector";

const StatusBar = ({ translations, setLocaleAndUpdateHistory }) => {
    const { formatMessage } = useIntl();

    return (
        <footer>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 text-center text-muted small py-1">
                        <a
                            href="/assets/changelog.txt"
                            target="_blank"
                            title={formatMessage({ id: "changelogLink" })}
                            className="text-muted text-decoration-none"
                        >
                            rBiblia Web - changelog
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default StatusBar;
