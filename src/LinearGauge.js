import React, { useEffect, useState } from 'react';
import { useAppContext } from './AppContext';
import {
    IgrLinearGauge,
    IgrLinearGraphRange,
} from "igniteui-react-gauges";

const colorScale = [
    "#DEEDCF",
    "#BFE1B0",
    "#99D492",
    "#74C67A",
    "#56B870",
    "#39A96B",
    "#1D9A6C",
    "#188977",
    "#137177",
    "#0E4D64",
    "#0A2F51",
];

const interval = 10;
const maximumValue = 100;

const LinearGauge = () => {
    let previousEndValue = -10;
    const [gaugeValue, setGaugeValue] = useState(0);
    const { fid, setGlobalFID } = useAppContext();

    useEffect(() => {
        setGaugeValue(fid)
      }, [fid]);

    return (
        <div style={{ padding: "10px"}}>
            <div style={{ padding: "4px 0px 0px 0px"}}>
                FID Value: {gaugeValue ? gaugeValue: "0"}
            </div>
            
            <p style={{color: "#808080", fontStyle: "italic"
}}>Shows the FID value of selected area</p>


            <IgrLinearGauge
                height="40px"
                width="450px"
                minimumValue={0}
                value={gaugeValue}
                maximumValue={maximumValue}
                interval={interval}
            >   
                {
                
                colorScale.map((color, index) => {
                    const startValue = previousEndValue;
                    const endValue = startValue + interval;
                    previousEndValue = endValue;
                    return (
                        <IgrLinearGraphRange
                            key={color}
                            name={color}
                            startValue={startValue}
                            endValue={endValue}
                            brush={color}
                        />
                    );
                })
                
                }
            </IgrLinearGauge>
        </div>
    );
};

export default LinearGauge;
