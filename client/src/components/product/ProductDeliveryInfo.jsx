import React from 'react';
import { FaTruck, FaMoneyBillWave, FaUndo, FaExchangeAlt, FaBolt } from 'react-icons/fa';

const ProductDeliveryInfo = ({ product }) => {
    if (!product) return null;

    const hasInfo = product.deliveryTime || product.codAvailable || product.expressDelivery || product.returnEligible || product.replacementEligible;
    if (!hasInfo) return null;

    return (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm mb-6 space-y-4">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <FaTruck /> Delivery &amp; Return Guarantees
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
                {product.deliveryTime && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                        <FaTruck className="text-indigo-400 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated Delivery</div>
                            <div className="font-bold text-slate-200">{product.deliveryTime}</div>
                        </div>
                    </div>
                )}

                {product.codAvailable && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                        <FaMoneyBillWave className="text-emerald-400 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Payment</div>
                            <div className="font-bold text-slate-200">COD Available</div>
                        </div>
                    </div>
                )}

                {product.expressDelivery && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                        <FaBolt className="text-amber-400 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Speed</div>
                            <div className="font-bold text-slate-200">Express Shipping</div>
                        </div>
                    </div>
                )}

                {product.returnEligible && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                        <FaUndo className="text-blue-400 shrink-0" />
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Policy</div>
                            <div className="font-bold text-slate-200">Easy Returns</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDeliveryInfo;
