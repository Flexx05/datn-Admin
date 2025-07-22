import { DatePicker, Select, Row, Col, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const { RangePicker } = DatePicker;

export interface DashboardFilterValue {
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}

export const DashboardFilter = ({
  onChange,
}: {
  onChange: (filter: DashboardFilterValue) => void;
}) => {
  const [month, setMonth] = useState<number | undefined>();
  const [year, setYear] = useState<number | undefined>();
  const [range, setRange] = useState<[any, any] | null>(null);

  const clearMonthYear = () => {
    setMonth(undefined);
    setYear(undefined);
  };

  const clearRange = () => {
    setRange(null);
  };

  const handleRangeChange = (dates: [any, any] | null) => {
    setRange(dates);
    if (dates && dates.length === 2) {
      clearMonthYear();
      onChange({
        startDate: dayjs(dates[0]).format("YYYY-MM-DD"),
        endDate: dayjs(dates[1]).format("YYYY-MM-DD"),
        month: undefined,
        year: undefined,
      });
    } else {
      onChange({});
    }
  };

  const handleMonthChange = (value: number | undefined) => {
    if (value === undefined) {
      setMonth(undefined);
      onChange({ month: undefined, year }); // Giữ nguyên year
      return;
    }
    const currentYear = dayjs().year();
    // Nếu chưa chọn năm thì mặc định lấy năm hiện tại
    const selectedYear = year ?? currentYear;
    setMonth(value);
    setYear(selectedYear);
    clearRange();
    onChange({ month: value, year: selectedYear });
  };

  const handleYearChange = (value: number | undefined) => {
    setYear(value);
    clearRange();
     if (value === undefined) {
       message.warning("Vui lòng chọn năm để lọc theo tháng hoặc năm!");
     }
    onChange({ month, year: value });
  };

  return (
    <Row gutter={8}>
      <Col>
        <RangePicker value={range as any} onChange={handleRangeChange} />
      </Col>
      <Col>
        <Select
          placeholder="Tháng"
          allowClear
          style={{ width: 120 }}
          value={month}
          onChange={handleMonthChange}
        >
          {[...Array(12)].map((_, i) => (
            <Select.Option key={i + 1} value={i + 1}>
              Tháng {i + 1}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col>
        <Select
          placeholder="Năm"
          allowClear
          style={{ width: 120 }}
          value={year}
          onChange={handleYearChange}
        >
          {[2022, 2023, 2024, 2025].map((y) => (
            <Select.Option key={y} value={y}>
              Năm {y}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};
